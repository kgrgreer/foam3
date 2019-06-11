#!/bin/bash

IN_DIR=$1
INSTANCE=$2

if [[ -d $IN_DIR ]]; then
    cd $IN_DIR
fi

# Sets varuables to lowercase
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')

declare -a sources=(
  "foam2/src"
  "nanopay/src"
 # "interac/src"
)

IN_FILE="tools/journals"
lines=`cat $IN_FILE`
for file in $lines; do
    for s in ${sources[*]}; do
        for f in $(find $s -name "$file" -o -name "${file}.jrl"); do
            echo "$f"
        done
    done

    if [[ ! -z "$INSTANCE" ]]; then
        if  [[ -f "deployment/$INSTANCE/$file" ]]; then
            echo "deployment/$INSTANCE/$file"
        fi
        if  [[ -f "deployment/$INSTANCE/${file}.jrl" ]]; then
            echo "deployment/$INSTANCE/${file}.jrl"
        fi
    fi
done