#!/bin/bash

port_24=("ufosrv1.ka.fzk.de")

function in_array() {
    local hay needle=$1
    shift
    for hay; do
        [[ $hay == $needle ]] && return 0
    done

    return 1
}

in_array $1 "${port_24[@]}"
if [ $? -eq 0 ]; then 
    echo -n 24
    exit
fi

echo -n 22
