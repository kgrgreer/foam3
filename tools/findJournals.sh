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

while getopts "I:J:" opt ; do
    case $opt in
        I) IN_FILE=$OPTARG ;;
        J) INSTANCE=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "deployment/$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')"
 # "interac/src"
)

echo "${sources[@]}"

while read -r file; do
    find ${sources[@]} -name "${file}" -o -name "${file}.jrl"
done < "${IN_FILE:-/dev/stdin}"

exit 0