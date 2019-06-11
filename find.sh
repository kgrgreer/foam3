#!/bin/bash
# Concatenate JDAO files from subdirectories into one JDAO

IN_DIR=$1
OUT_DIR=$2
INSTANCE=$3

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

# Array of source directories
declare -a sources=(
  "foam2/src"
  "nanopay/src"
 # "interac/src"
)

> "${OUT_DIR}/journals"
IN_FILE="tools/journals"
lines=`cat $IN_FILE`
for file in $lines; do
  # Go through the array and check each location for the file and concatenate into one JDAO
  # create journals file used by build.sh
  # FIXME: this printf is generating two files, one at OUT_DIR/journals, but another in the current directory.
  echo "${file}" >> "$OUT_DIR"/journals

  journal_file="$file".0

  # Emptys the file
  > "$OUT_DIR/$journal_file"

  # non .jrl files
  # Recursively go through the directory and find if the files exists.
  # If they do, then concatenate the files into one.
  for s in ${sources[*]}
  do
    for f in $(find $s -name "$file" -o -name "${file}.jrl")
    do
        cat $f >> "$OUT_DIR/$journal_file"
    done
  done

  if [[ ! -z "$INSTANCE" ]]; then
      if  [[ -f "deployment/$INSTANCE/$file" ]]; then
          cat "deployment/$INSTANCE/$file" >> "$OUT_DIR/$journal_file"
      fi
      if  [[ -f "deployment/$INSTANCE/${file}.jrl" ]]; then
          cat "deployment/$INSTANCE/${file}.jrl" >> "$OUT_DIR/$journal_file"
      fi
  fi
done

cp $IN_FILE ${OUT_DIR}/journals
INFILE=target/journal_files
lines=`cat $INFILE`
for filePath in $lines; do
  file=$(basename "${filePath%.*}")
  journal_file="$file".0

  > "$OUT_DIR/$journal_file"
  echo "cat ${filePath} >> ${OUT_DIR}/${journal_file}"
done

exit 0
