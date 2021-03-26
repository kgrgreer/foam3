#!/bin/bash

IN_FILE=
INSTANCES=
OUT_FILE=
EXPLICIT_FILES=
EXTRA_FILES=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -A : Extra journal files to include in the build"
    echo "  -E : Specify explicit journal source directories, ignore faom2 and nanopay source directories."
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -J : deployment journals"
    echo "  -O : Output File, no option defaults to stdout"
}

while getopts "A:E:I:J:O:" opt ; do
    case $opt in
        A) EXTRA_FILES=$OPTARG ;;
        I) IN_FILE=$OPTARG ;;
        J) INSTANCES=$OPTARG ;;
        O) OUT_FILE=$OPTARG ;;
        E) EXPLICIT_FILES=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

declare -a sources=(
)


sources+=("foam2/src")
sources+=("nanopay/src")

if [ ! -z ${EXTRA_FILES} ]; then
    IFS=',' read -ra DIRS <<< "$EXTRA_FILES"
    for d in "${DIRS[@]}"; do
        sources+=("$(echo "$d" | tr '[:upper:]' '[:lower:]')")
    done
fi

if [ ! -z ${INSTANCES} ]; then
    IFS=',' read -ra DIRS <<< "$INSTANCES"
    for d in "${DIRS[@]}"; do
        sources+=("deployment/$(echo "$d" | tr '[:upper:]' '[:lower:]')")
    done
fi

if [ ! -z ${EXPLICIT_FILES} ]; then
    IFS=',' read -ra DIRS <<< "${EXPLICIT_FILES}"
    for d in "${DIRS[@]}"; do
        sources+=("$(echo "$d" | tr '[:upper:]' '[:lower:]')")
    done
fi

if [ ! -z $OUT_FILE ]; then
    rm $OUT_FILE
fi

sed 's/#.*//;s/^[[:space:]]*//;s/[[:space:]]*$//' < "${IN_FILE:-/dev/stdin}" | while read -r file; do
    if [ ! -z $file ]; then
        find ${sources[@]} -type f \( -name "${file}" -o -name "${file}.jrl" \) >> "${OUT_FILE:-/dev/stdout}"
    fi
done

exit 0
