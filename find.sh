#!/bin/bash
# Concatenate JDAO files from subdirectories into one JDAO

IN_DIR=$1
OUT_DIR=$2
IS_AWS=$3

if [[ -d $IN_DIR ]]; then
    cd $IN_DIR
fi

if [[ ! -d $OUT_DIR ]]; then
    OUT_DIR=target/journals
fi
mkdir -p "$OUT_DIR"

MODE=1
INSTANCE=1
VERSION=1

# Sets varuables to lowercase
MODE=$(echo "$MODE" | tr '[:upper:]' '[:lower:]')
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')
VERSION=$(echo "$VERSION" | tr '[:upper:]' '[:lower:]')

# Creates an array of the file names
declare -a arr=(
  "acceptanceDocuments"
  "accounts"
  "ascendantfxusers"
  "ascendantUserPayeeJunctions"
  "branches"
  "brokers"
  "businessSectors"
  "identificationTypes"
  "businessTypes"
  "corridors"
  "countries"
  "cronjobs"
  "currencies"
  "currencyfxServices"
  "dugs"
  "emailTemplates"
  "exportDriverRegistrys"
  "fundTransferSystems"
  "groups"
  "htmlDoc"
  "institutions"
  "institutionPurposeCodes"
  "languages"
  "lineItemTypes"
  "lineItemTypeAccounts"
  "lineItemFees"
  "lineItemTax"
  "menus"
  "notificationTemplates"
  "payoutOptions"
  "permissions"
  "questionnaires"
  "quickConfig"
  "quickToken"
  "regions"
  "reports"
  "scripts"
  "services"
  "spids"
  "tests"
  "transactionfees"
  "transactionLimits"
  "transactionPurposes"
  "zeroAccountUserAssociations"
  "txnProcessors"
  "users"
  "xeroConfig"
  "xeroToken"
  )

# Array of source directories
declare -a sources=(
  "foam2/src"
  "nanopay/src"
  "interac/src"
)

# Go through the array and check each location for the file and concatenate into one JDAO
# create journals file used by build.sh
# FIXME: this printf is generating two files, one at OUT_DIR/journals, but another in the current directory.
printf "%s\n" "${arr[@]}" > "$OUT_DIR"/journals

for file in "${arr[@]}"
do
  journal_file="$file".0

  # Emptys the file
  > "$OUT_DIR/$journal_file"

  # Recursively go through the directory and find if the files exists.
  # If they do, then concatenate the files into one.
  for s in ${sources[*]}
  do
    for f in $(find $s -name "$file")
    do
        cat $f >> "$OUT_DIR/$journal_file"
    done
  done

  if  [[ -f "deployment/$file" ]]; then
      cat deployment/$file >> "$OUT_DIR/$journal_file"
  fi
  if  [[ -f "deployment/$MODE/$file" ]]; then
      cat deployment/$MODE/$file >> "$OUT_DIR/$journal_file"
  fi
  if  [[ -f "deployment/$MODE/$INSTANCE/$file" ]]; then
      cat deployment/$MODE/$INSTANCE/$file >> "$OUT_DIR/$journal_file"
  fi
  if  [[ -f "deployment/$MODE/$VERSION/$file" ]]; then
      cat deployment/$MODE/$VERSION/$file >> "$OUT_DIR/$journal_file"
  fi
  if  [[ -f "deployment/$MODE/$INSTANCE/$VERSION/$file" ]]; then
      cat deployment/$MODE/$INSTANCE/$VERSION/$file >> "$OUT_DIR/$journal_file"
  fi

  # .jnl files - transition
  # rename the files as you go
  for s in ${sources[*]}
  do
    for f in $(find $s -name "${file}.jnl")
    do
        cat $f >> "$OUT_DIR/$journal_file"
        if [[ $IS_AWS -ne 1 ]]; then
          case $f in
            *.jnl )
            mv "$f" "$(dirname $f)/$(basename "$f" .jnl).jrl"
            ;;
          esac
        fi
    done
    for f in $(find $s -name "${file}.jrl")
    do
      cat $f >> "$OUT_DIR/$journal_file"
    done
  done

  if  [[ -f "deployment/${file}.jnl" ]]; then
      cat "deployment/${file}.jnl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jnl )
          mv "deployment/${file}.jnl" "deployment/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/${file}.jrl" ]]; then
    cat "deployment/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/${file}.jnl" ]]; then
      cat "deployment/$MODE/${file}.jnl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jnl )
          mv "deployment/$MODE/${file}.jnl" "deployment/$MODE/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/${file}.jnl" ]]; then
      cat "deployment/$MODE/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/$INSTANCE/${file}.jnl" ]]; then
      cat "deployment/$MODE/$INSTANCE/${file}.jnl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jnl )
          mv "deployment/$MODE/$INSTANCE/${file}.jnl" "deployment/$MODE/$INSTANCE/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/$INSTANCE/${file}.jrl" ]]; then
    cat "deployment/$MODE/$INSTANCE/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/$VERSION/${file}.jnl" ]]; then
      cat "deployment/$MODE/$VERSION/${file}.jnl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jnl )
          mv "deployment/$MODE/$VERSION/${file}.jnl" "deployment/$MODE/$VERSION/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/$VERSION/${file}.jrl" ]]; then
      cat "deployment/$MODE/$VERSION/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/$INSTANCE/$VERSION/${file}.jnl" ]]; then
      cat "deployment/$MODE/$INSTANCE/$VERSION/${file}.jnl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jnl )
          mv "deployment/$MODE/$INSTANCE/$VERSION/${file}.jnl" "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" ]]; then
    cat "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

done

exit 0
