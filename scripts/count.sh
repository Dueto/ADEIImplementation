#! /bin/bash


srv="http://ipekatrinadei.ka.fzk.de/adei/"
props="db_server=cs0&db_name=ControlSystem_rep.20120711"
setup="katrin"


req="$srv/services/list.php?setup=$setup&target=groups&$props"
echo $req

res=`curl $req 2>/dev/null | xmllint --format - | grep "<Value" | sed -e "s/.*value=\"\([^\"]\+\)\".*/\\1/"`

for gr in $res; do
    req="$srv/services/list.php?setup=$setup&target=items&$props&db_group=$gr"
    lines=`curl $req 2>/dev/null | xmllint --format - | wc -l`
    
    echo "Group: $gr, Lines: $lines"
done
