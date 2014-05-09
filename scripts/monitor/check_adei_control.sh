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
resp=`curl -s --proxy "" "$adei_url/services/control.php?target=get&setup=$2&db_server=$3&db_name=$4&control_group=$5"`
channels=`echo $resp | xmllint --format - 2> /dev/null | grep "Value" | wc -l`
if [ $channels -eq 0 ]; then
    error=`echo $resp | xmllint --format - 2> /dev/null | grep "<Error>"`
    if [ -n "$error" ]; then
	echo $error | sed -e "s|</\?Error>||g"
    else
	code=`curl -s --proxy "" -w "%{http_code}" -o /dev/null "$adei_url/services/control.php?target=get&setup=$2&db_server=$3&db_name=$4&control_group=$5"`
	if [ $code -lt 200 -o $code -gt 299 ]; then
	    echo -n "HTTP Error: $code"
	    if [ $code -eq 403 ]; then 
		echo " (Access Denied)"
	    else
		echo
	    fi
	else
	    echo $resp
	fi
    fi
    status=0
fi
echo $status
