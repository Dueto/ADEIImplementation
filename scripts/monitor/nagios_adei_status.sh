#!/bin/bash

remote=$1
server=`echo $remote | cut -d ':' -f 1`
if [ "$server" == "$remote" ]; then 
    port=`/opt/scripts/nagios_ssh_port.sh $server`
else
    port=`echo $remote | cut -d ':' -f 2`
fi
shift

params=""
for param in "$@"; do
    params="$params \"$param\""
done

output=`ssh -p $port root@$server /opt/scripts/check_adei_status.sh $params`
last_line=`echo "$output" | tail -1`

status=`echo $last_line | cut -d ' ' -f 1`
echo -n ${last_line#$status}

#size=`echo $last_line | cut -d ' ' -f 4`
#if [ -n "$size" ]; then echo -n " GB"; fi

if [ $status -ne 1 ]; then 
    echo -n " -- "

    lines=`echo "$output" | wc -l`
    if [ $lines -gt 1 ]; then
	echo "$output" | head -n 1 | tr -d '\n'
	echo " ... "
    else
	echo "$output" | head -n 1
    fi
    echo "------------------"
    echo "$output"  | head -n -1
else
    echo
fi

if [ "$status" -eq 0 ]; then
	exit "2"
elif [ "$status" -eq 1 ]; then
	exit "0"
else
	exit "1"
fi
