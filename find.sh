#!/bin/bash
# Concatenate JDAO files from subdirectories into one JDAO

IN_FILE=
JOURNAL_FILE=
OUT_DIR=
INSTANCE=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -O : Output Directory"
    echo "  -F : Journal List File"
    echo "  -J : Instance"
}

while getopts "F:I:O:J:" opt ; do
    case $opt in
        F) JOURNAL_FILE=$OPTARG ;;
        I) IN_FILE=$OPTARG ;;
        O) OUT_DIR=$OPTARG ;;
        J) INSTANCE=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

if [[ ! -d $OUT_DIR ]]; then
    OUT_DIR=target/journals
fi
mkdir -p "$OUT_DIR"

# Sets varuables to lowercase
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')

echo "INFO :: $0 IN_FILE=${IN_FILE} JOURNAL_FILE=${JOURNAL_FILE} OUT_DIR=${OUT_DIR} INSTANCE=${INSTANCE}"
cp $JOURNAL_FILE ${OUT_DIR}/journals

# Delete current runtime journals
rm ${OUT_DIR}/*.0

lines=`cat ${IN_FILE:-/dev/stdin}`
for filePath in $lines; do
  file=$(basename "${filePath%.*}")
  journal_file="$file".0
  cat ${filePath} >> ${OUT_DIR}/${journal_file}
done

exit 0
