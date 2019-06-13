#!/bin/bash
# Concatenate JDAO files from subdirectories into one JDAO

IN_FILE=
OUT_DIR=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -O : Output Directory"
}

while getopts "I:O:" opt ; do
    case $opt in
        I) IN_FILE=$OPTARG ;;
        O) OUT_DIR=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

if [[ ! -d $OUT_DIR ]]; then
    OUT_DIR=target/journals
fi
mkdir -p "$OUT_DIR"

echo "INFO :: $0 IN_FILE=${IN_FILE} OUT_DIR=${OUT_DIR}"

# Delete current runtime journals
rm ${OUT_DIR}/*.0

lines=`cat ${IN_FILE:-/dev/stdin}`
for filePath in $lines; do
  cat ${filePath} >> ${OUT_DIR}/"$(basename "${filePath%.*}")".0
done

exit 0
