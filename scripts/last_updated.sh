#! /bin/bash


srv="http://katrin.kit.edu/adei/"
setup="katrin"

function check {
    props=$1
    src=$2
    
    req="$srv/services/list.php?setup=$setup&target=groups&$props"
    res=`curl $req 2>/dev/null | xmllint --format - | grep "<Value" | sed -e "s/.*value=\"\([^\"]\+\)\".*name=\"\([^\"]\+\)\".*/\\1,\\2/"`
    for gr in $res; do
        grid=`echo $gr | cut -d ',' -f 1`
        grname=`echo $gr | cut -d ',' -f 2`
        
        req="$srv/services/list.php?setup=$setup&target=items&$props&db_group=$grid"
        lines=`curl $req 2>/dev/null | xmllint --format - | wc -l`
        req="$srv/services/getdata.php?setup=$setup&$props&db_group=$grid&window=-1&experiment=-&db_mask=0" 
        updated=`curl $req 2>/dev/null | tail -n 1 | cut -d ',' -f 1`
        echo "$src  $grname    Channels: $lines, Updated: $updated"
    done
}

check "db_server=fpd&db_name=katrin_rep" "FPD"
check "db_server=msz&db_name=Monitorspeczeus_rep" "MOS"
check "db_server=msz&db_name=aircoils_rep" "AC "
