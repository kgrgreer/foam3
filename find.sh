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

echo "INFO :: $0 IN_FILE=${IN_FILE} OUT_DIR=${OUT_DIR}"

if [[ ! -d $OUT_DIR ]]; then
    OUT_DIR=target/journals
fi
mkdir -p "$OUT_DIR"

rm ${OUT_DIR}/*.0

while read -r filePath; do
  cat ${filePath} >> ${OUT_DIR}/"$(basename "${filePath%.jrl}")".0
  # Add a newline if one is missing so we don't put two journal entries on
  # the same line.
  test "$(tail -c 1 "${filePath}" | wc -l)" -eq 0 && echo "" >> ${OUT_DIR}/"$(basename "${filePath%.jrl}")".0
done < ${IN_FILE:-/dev/stdin}

exit 0
