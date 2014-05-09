#!/bin/bash
unixtime=$1
perl -e "print 'Local Time:  ' . scalar(localtime($unixtime)) . \"\n\""
perl -e "print 'GMT   Time:  ' . scalar(gmtime($unixtime)) . \"\n\""
