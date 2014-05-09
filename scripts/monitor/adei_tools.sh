vercomp() {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}

adei_version_check() {
    vercomp $adei_revision $1
    res=$?
    if [ $res -eq 1 ]; then 
	return 0
    elif [ $res -eq 2 ]; then 
	return 1;
    fi
    
    if [ -z "$2" -o -z "$adei_date" ]; then 
	return 0
    fi

    if [ $adei_date -ge $2 ]; then
	return 0
    fi
    
    return 1
}

adei_version=`curl -s --proxy "" "$adei_url/services/info.php?target=version&encoding=text"`
#adei_version="0.0.8"
adei_revision=`echo $adei_version | cut -d '-' -f 1`
if [ "$adei_revision" == "$adei_version" ]; then 
    adei_date=""; 
else
    adei_date=`echo $adei_version | cut -d '-' -f 2`
fi

