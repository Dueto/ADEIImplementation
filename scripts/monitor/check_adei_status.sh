#!/bin/bash

if [ -z "$1" ]; then
    . /opt/scripts/adei_config.sh
else
    echo $1 | grep -E "[^a-z0-9_\-]" &> /dev/null
    if [ $? -eq 0 ]; then exit; fi
    if [ ! -f /opt/scripts/${1}_config.sh ]; then exit; fi
    . /opt/scripts/${1}_config.sh
fi

status=1

#adei=`ps xa | grep cache.php | grep -v grep | wc -l`
#if [ $adei -gt 1 ]; then
#    echo "Too many ADEI caching scripts are running, currently: $adei"
#    status=0
#fi

mails=`mailutil check | cut -d ' ' -f 6`
if [ "$mails" == "in" ]; then
    mails=`mailutil check | cut -d ' ' -f 4`
fi

if [ $mails -gt 0 ]; then
    lastmail=`echo "type $mails" | mailx -R "" -N`
    dt=`echo "$lastmail" | sed -ne '/^Date:/ {s/^Date:\s*// p;q};'`
    cur=`date -u +%s`
    last=`date -u --date "$dt" +%s`
    since=$((($cur - $last) / 60))
    if [ $since -le 60 ]; then
	echo "There is $mails message in root mailbox, the last message is from $dt"
	if [ $since -le 10 ]; then
	    if [ $mails -le 30 ]; then
		if [ $status -eq 1 ]; then status=2 ; fi
	    else
		status=0
	    fi
	    echo "$lastmail" | sed -e '1,/^$/d' | head -n 10
	elif [ $since -le 1440 ]; then
	    if [ $status -eq 1 ]; then status=2 ; fi
	fi
    fi
fi

apache=`ps xa | grep apache | grep -v grep | wc -l`
if [ $apache -eq 0 ]; then
    echo "Apache server is stopped"
    status=0
fi

mysql=`ps xa | grep mysqld | grep -v grep | wc -l`
if [ $mysql -eq 0 ]; then
    echo "MySQL server is stopped"
    status=0
fi

tmp_size=$((`du -sm $adei_path/tmp/ | cut -f 1` / 1024))
if [ $tmp_size -gt 10 ]; then
    echo "Temporary folder has grown over $tmp_size GB"
    if [ $status -eq 1 ]; then status=2 ; fi
fi

errors=`curl -s --proxy "" "$adei_url/services/info.php?target=log&interval=3600&encoding=text&setup="`
if [ -n "$errors" ]; then 
    n_errors=`echo "$errors" | wc -l`
else
    n_errors=0
fi
if [ $n_errors -gt 0 ]; then
    echo "ADEI log contains errors, $n_errors events for last hour"
    echo "$errors" | head -n 1
    if [ $status -eq 1 ]; then status=2 ; fi
fi

long=`grep "Maximum execution time" $apache_log | tail -n 1 | sed -e "s/^\[\([^\[]\+\)\].*$/\1/"`
if [ -n "$long" ]; then
    ts=`date --date "$long" +%s`
    cur=`date +%s`
    if [ $(($cur - $ts)) -le 86400 ]; then
	echo "Execution time exceeding limits set by Apache (last message $long)"
	if [ $status -eq 1 ]; then status=2 ; fi
    fi
fi

adei_version=`curl -s --proxy "" "$adei_url/services/info.php?target=version&encoding=text"`
if [ -n "$adei_db" ]; then
    adei_size=`du -sm $adei_db | cut -f 1`
    adei_size=`expr $adei_size / 1024`
    echo "$status ADEI $adei_version $adei_size GB"
else
    echo "$status ADEI $adei_version"
fi
