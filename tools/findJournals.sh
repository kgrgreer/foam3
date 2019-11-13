#!/bin/bash

IN_FILE=
INSTANCE=
OUT_FILE=
EXTRA_FILES=
FILE_POSTFIX=jrl

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -J : Instance"
    echo "  -O : Output File, no option defaults to stdout"
    echo "  -E : Specify extra journal source directory"
}

while getopts "I:J:O:E:P:" opt ; do
    case $opt in
        I) IN_FILE=$OPTARG ;;
        J) INSTANCE=$OPTARG ;;
        O) OUT_FILE=$OPTARG ;;
        E) EXTRA_FILES=$OPTARG ;;
        P) FILE_POSTFIX=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "deployment/$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')"
 # "interac/src"
)

if [ ! -z $EXTRA_FILES ]; then
    sources+=($EXTRA_FILES)
fi

if [ ! -z $OUT_FILE ]; then
    rm $OUT_FILE
fi

sed 's/#.*//;s/^[[:space:]]*//;s/[[:space:]]*$//' < "${IN_FILE:-/dev/stdin}" | while read -r file; do
    if [ ! -z $file ]; then
        if [ "$FILE_POSTFIX" == "jrl" ]; then
            find ${sources[@]} -type f \( -name "${file}" -o -name "${file}.${FILE_POSTFIX}" \) >> "${OUT_FILE:-/dev/stdout}"
        else
            find ${sources[@]} -type f \( -name "${file}.${FILE_POSTFIX}" \) >> "${OUT_FILE:-/dev/stdout}"
        fi
    fi
done

exit 0