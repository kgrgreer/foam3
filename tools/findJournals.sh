#!/bin/bash

IN_FILE=
INSTANCE=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -J : Instance"
}

while getopts "F:I:O:J:" opt ; do
    case $opt in
        I) IN_FILE=$OPTARG ;;
        J) INSTANCE=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

# Sets varuables to lowercase
declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "deployment/$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')"
 # "interac/src"
)

lines=`cat ${IN_FILE:-/dev/stdin}`
for file in $lines; do
    for s in ${sources[*]}; do
        for f in $(find $s -name "$file" -o -name "${file}.jrl"); do
            echo "$f"
        done
    done
done

exit 0