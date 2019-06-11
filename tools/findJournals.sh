#!/bin/bash

IN_DIR=$1
IN_FILE=$2
INSTANCE=$3

if [[ -d $IN_DIR ]]; then
    cd $IN_DIR
fi

# Sets varuables to lowercase
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')

declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "deployment/${INSTANCE}"
 # "interac/src"
)

lines=`cat $IN_FILE`
for file in $lines; do
    for s in ${sources[*]}; do
        for f in $(find $s -name "$file" -o -name "${file}.jrl"); do
            echo "$f"
        done
    done
done

exit 0