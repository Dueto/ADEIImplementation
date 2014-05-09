#!/bin/bash

mysql -N -u adei -padeipw -e "SELECT CONCAT('DROP TABLE ', GROUP_CONCAT(table_name), ';') FROM information_schema.tables WHERE table_name LIKE 'cache%__fastgen__%'" adei | mysql -u adei -padeipw adei
