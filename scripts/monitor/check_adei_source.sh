#!/bin/bash


if [ -z "$1" ]; then
    . /opt/scripts/adei_config.sh
else
    echo $1 | grep -E "[^a-z0-9_\-]" &> /dev/null
    if [ $? -eq 0 ]; then exit; fi
    if [ ! -f /opt/scripts/${1}_config.sh ]; then exit; fi
    . /opt/scripts/${1}_config.sh
fi

. /opt/scripts/adei_tools.sh

if [ "$4" == "#1" ]; then
    databases=`curl -s --proxy "" "$adei_url/services/list.php?target=databases&setup=$2&db_server=$3" | xmllint --format - | grep "Value" | sed -e "s/^.*db_name=\"\([^\"]*\)\".*$/\\1/" | sed -e "s/ /::space::/"`
    if [ $? -ne 0 -o -z "$databases" ]; then
	echo "Failed to query ADEI databases"
	echo 0 0 0
        exit
    fi    
    db_name=`echo "$databases" | head -n 1`
else
    db_name=$4
fi

status=1
n_groups=0
cache_size=0
cur=`date -u +%s`

filter=$5
group_mode=0
#groups=`curl -s -m 3 --proxy "" "$adei_url/services/list.php?target=groups&info=1&setup=$2&db_server=$3&db_name=$db_name" | xmllint --format - | grep "Value" | sed -e "s/^.*db_group=\"\([^\"]*\)\".*$/\\1/" | sed -e "s/ /::space::/"`
groups=`curl -s -m 12 --proxy "" "$adei_url/services/list.php?target=groups&info=1&setup=$2&db_server=$3&db_name=$db_name"`
if [ $? -ne 0 ]; then
    groups=`curl -s -m 5 --proxy "" "$adei_url/services/list.php?target=groups&setup=$2&db_server=$3&db_name=$db_name"`
    if [ $? -ne 0 ]; then
        echo "Failed to query ADEI groups"
        echo 0 0 0
        exit
    else
	echo "Data queries are too slow, check database indexes"
	group_mode=1
	status=0
    fi
fi

groups=`echo "$groups" | xmllint --format - | grep "Value"`
if [ $? -ne 0 ]; then
    echo "Invlid group list received from ADEI: $groups"
    echo 0 0 0
    exit
fi
 
if [ $group_mode -eq 0 ]; then
    groups=`echo "$groups" | sed -e "s/ /::space::/g"`
else
    groups=`echo "$groups" | sed -e "s/^.*db_group=\"\([^\"]*\)\".*$/\\1/" | sed -e "s/ /::space::/"`
fi

if [ -z "$groups" ]; then
    echo "ADEI query returned no groups"
    echo 0 0 0
    exit
fi

error=${groups#ERROR: }
if [ "$error" != "$groups" ]; then
    echo "$gid: $error"
    echo 0 0 0
    exit
fi


for group in $groups; do
    n_groups=$(($n_groups + 1))

    nodata=0
    if [ $group_mode -eq 0 ]; then
	group=`echo "$group" | sed -e "s/::space::/ /g"`
	gid=`echo "$group" | sed -e "s/^.*db_group=\"\([^\"]*\)\".*$/\\1/"`
	if [ "$gid" == "$group" ]; then
	    echo "Invalid group specification received from ADEI server: $group"
	    status=0
	    continue
	fi
	urlgid=`echo $gid | sed -e "s/ /+/g"`
	last=$group
    else
	urlgid=`echo $group | sed -e "s/::space::/+/"`
	gid=`echo $group | sed -e "s/::space::/ /"`
	last=`curl -s -m 3 --proxy "" "$adei_url/services/list.php?target=groups&info=1&setup=$2&db_server=$3&db_name=$db_name&db_group=$urlgid"`
	if [  $? -ne 0  ]; then
	    echo "Queries to $gid are too slow, check database indexes"
	    status=0
	    nodata=1
	else 
    	    error=${last#ERROR: }
	    if [ "$error" != "$last" ]; then
		echo "$gid: $error"
		status=0
		nodata=1
	    fi
	    last=`echo $last | grep "Value"`
	fi
	
    fi

    if [ $nodata -eq 0 ]; then
        echo "$last" | grep "last=" &> /dev/null
	if [ $? -eq 0 ]; then
    	    ts=`echo $last | sed -e "s/^.*last=\"\([^\"]*\)\".*$/\\1/" | cut -d '.' -f 1`
    	    if [ -z "$ts" ]; then
    		nodata=1
#		echo "$gid: contains no data"
#		if [ $status -eq 1 ]; then status=2; fi
    	    fi
	else 
	    ts=""
	    nodata=1
#	    echo "$gid: contains no data"
#	    if [ $status -eq 1 ]; then status=2; fi
	fi
    else
	ts=$cur
    fi
    
    
    if [ $nodata -eq 0 ]; then
	since=$((($cur - $ts) / 3600))
	if [ $since -gt 0 ]; then
	    if [ -n "$filter" ]; then
		echo "$gid" | grep -P "$filter" &>/dev/null
		accept=$?
	    else
		accept=1
	    fi
	
	    if [ $accept -ne 0 ]; then
        	last=`date -u -d "@$ts" "+%F %R:%S"`
		echo "$gid: Last updated on $last"
		if [ $status -eq 1 ]; then
		    status=2
		fi
#	    	continue
	    fi
	fi
    fi
    
    
    info=`curl -s --proxy "" "$adei_url/services/info.php?target=cache&setup=$2&db_server=$3&db_name=$db_name&db_group=$urlgid" | xmllint --format - | grep "Value"`
    dbsize=`echo $info | sed -e "s/^.*dbsize=\"\([^\"]*\)\".*$/\\1/"`
    

    if [ ${#dbsize} -gt 16 ]; then
	# Otherwise both cache & data are missing. We think it is tolerable
	if [ $nodata -eq 0 ]; then 
	    echo "$gid: Cache is empty"
	    if [ $status -eq 1 ]; then status=2; fi
	fi
	continue
    else
	cache_size=$(($cache_size + `echo $info | sed -e "s/^.*dbsize=\"\([^\"]*\)\".*$/\\1/"`))

	last_cache=`echo $info | sed -e "s/^.*last=\"\([^\"]*\)\".*$/\\1/"`
	if [ "$info" == "$last_cache" ]; then
	    # There is data in the source, but cache is empty (but we should detect this earlier)
	    # Otherwise, - no cache, no data (which is OK) or we already reported about troublesome source
	    if [ $nodata -eq 0 ]; then
		last_cache=0			
		echo "$gid: Cache is empty (but non-zero size is reported)"
		if [ $status -eq 1 ]; then status=2; fi
	    fi
	    continue
	else 
	    if [ -z "$ts" ]; then
		echo -n "$gid: contains no data, but cached until "
	        date -u -d "@$last_cache" "+%F %R:%S"
		if [ $status -eq 1 ]; then status=2; fi
		continue
	    else
		since=$((($ts - $last_cache) / 3600))
	    fi
	fi
	
	if [ $since -gt 0 ]; then
	    real_width=`curl -s --proxy "" "$adei_url/services/list.php?target=items&setup=$2&db_server=$3&db_name=$db_name&db_group=$urlgid"`
	    if [ $? -eq 0 ]; then real_width=`echo "$real_width" | xmllint -format -`; fi
	    
	    if [ $? -ne 0 ]; then
		status=0
		echo "$gid: item list service failed"
	    else
		real_width=$((`echo "$real_width" | wc -l` - 3))
	    fi

	    if [ $real_width -le 0 ]; then
		echo "$gid: Invalid number of items reported by list sevice ($real_width)"
		status=0
		continue
	    fi

	    width=`echo $info | grep width=`
	    if [ -z "$width" ]; then 
		echo "$gid: Invalid cache information from ADEI server, width parameter missing"
		status=0
		continue
	    fi
	    
	    width=`echo $info | sed -e "s/^.*width=\"\([^\"]*\)\".*$/\\1/"`
	    if [ $width -eq 0 ]; then
		echo "$gid: Invalid cache information from ADEI server, width parameter is zero"
		status=0
		continue
	    fi
	    
	    found_reason=0

	    if [ "$real_width" -ne "$width" ]; then
		found_reason=1
		status=0
	        echo "$gid: Channel mistmatch $width (cache) and $real_width (reader)"
	    fi
		
	
#	    if [ $nodata -eq 0 ]; then 
#		if [ $found_reason -eq 0 ]; then
#		    # Using current version, we are not able to handle properly limit & filtering together
#		    adei_version_check "0.0.10"
#		    if [ $? -eq 0 ]; then
#			last_data=`curl -s --proxy "" "$adei_url/services/getdata.php?setup=$2&db_server=$3&db_name=$db_name&db_group=$urlgid&window=0,1"`
#			if [ $? -ne 0 ]; then
#			    found_reason=1
#			    status=0
#			    echo -n "$gid: No valid data in database, but there is (filtered?) records. Last one from "
#			    date -u -d "@$ts" "+%F %R:%S"
#			fi
#		    fi
#		fi
#	    fi

	    if [ $found_reason -eq 0 ]; then
		status=0
	        echo "$gid: Last $since hours are not cached"
	    fi
	fi
    fi
done

if [ $n_groups -eq 0 ]; then
    status=0
fi

cache_size=$(($cache_size / 1073741824))
echo "$status $n_groups $cache_size"
