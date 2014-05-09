#!/bin/bash
unixtime=`expr $1 - 2082844800`
perl -e "print 'Local Time:  ' . scalar(localtime($unixtime)) . \"\n\""
perl -e "print 'GMT   Time:  ' . scalar(gmtime($unixtime)) . \"\n\""
