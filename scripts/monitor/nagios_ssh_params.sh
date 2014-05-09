#!/bin/bash

echo -n " -l "
/opt/scripts/nagios_ssh_user.sh $1
echo -n " -p "
/opt/scripts/nagios_ssh_port.sh $1
