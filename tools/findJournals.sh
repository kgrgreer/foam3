#!/bin/bash

IN_FILE=$1
INSTANCE=$2

# Sets varuables to lowercase
declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "deployment/$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')"
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