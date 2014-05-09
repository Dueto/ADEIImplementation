#!/bin/bash
ticks=`expr $1 - 621355968000000000`
unixtime=`expr $ticks / 10000000`
perl -e "print 'Local Time:  ' . scalar(localtime($unixtime)) . \"\n\""
perl -e "print 'GMT   Time:  ' . scalar(gmtime($unixtime)) . \"\n\""
