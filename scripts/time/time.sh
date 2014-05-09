#!/bin/bash

unixtime=`date +%s -u -d "$1"`
zeustime=`expr $unixtime + 2082844800`
perl -e "print 'Local Time:  ' . scalar(localtime($unixtime)) . \"\n\""
perl -e "print 'GMT   Time:  ' . scalar(gmtime($unixtime)) . \"\n\""
echo           "ZEUS  Time:  $zeustime"
