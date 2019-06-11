#!/bin/bash
# Concatenate JDAO files from subdirectories into one JDAO

IN_DIR=$1
IN_FILE=$2
JOURNAL_FILE=$3
OUT_DIR=$4
INSTANCE=$5

if [[ -d $IN_DIR ]]; then
    cd $IN_DIR
fi

if [[ ! -d $OUT_DIR ]]; then
    OUT_DIR=target/journals
fi
mkdir -p "$OUT_DIR"

# Sets varuables to lowercase
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')

echo "INFO :: $0 IN_DIR=${IN_DIR} OUT_DIR=${OUT_DIR} INSTANCE=${INSTANCE}"
cp $JOURNAL_FILE ${OUT_DIR}/journals

# Delete current runtime journals
rm ${OUT_DIR}/*.0

lines=`cat $IN_FILE`
for filePath in $lines; do
  file=$(basename "${filePath%.*}")
  journal_file="$file".0
  cat ${filePath} >> ${OUT_DIR}/${journal_file}
done

exit 0
