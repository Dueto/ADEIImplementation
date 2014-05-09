#!/bin/bash

function in_array() {
    local hay needle=$1
    shift
    for hay; do
        [[ $hay == $needle ]] && return 0
    done

    return 1
}

echo -n root
