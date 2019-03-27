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

MODE=${IS_AWS}
INSTANCE=1
VERSION=1

# Sets varuables to lowercase
MODE=$(echo "$MODE" | tr '[:upper:]' '[:lower:]')
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')
VERSION=$(echo "$VERSION" | tr '[:upper:]' '[:lower:]')

echo MODE=${MODE}

# Creates an array of the file names
declare -a arr=(
  "acceptanceDocuments"
  "accounts"
  "ascendantfxusers"
  "ascendantUserPayeeJunctions"
  "blacklists"
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
  "quickbooksConfig"
  "quickbooksToken"
  "regions"
  "reports"
  "rules"
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

  # .jrl files - transition
  for s in ${sources[*]}
  do
    for f in $(find $s -name "${file}.jrl")
    do
      cat $f >> "$OUT_DIR/$journal_file"
    done
  done

  if  [[ -f "deployment/${file}.jrl" ]]; then
      cat "deployment/${file}.jrl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jrl )
          mv "deployment/${file}.jrl" "deployment/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/${file}.jrl" ]]; then
    cat "deployment/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/${file}.jrl" ]]; then
      cat "deployment/$MODE/${file}.jrl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jrl )
          mv "deployment/$MODE/${file}.jrl" "deployment/$MODE/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/${file}.jrl" ]]; then
      cat "deployment/$MODE/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/$INSTANCE/${file}.jrl" ]]; then
      cat "deployment/$MODE/$INSTANCE/${file}.jrl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jrl )
          mv "deployment/$MODE/$INSTANCE/${file}.jrl" "deployment/$MODE/$INSTANCE/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/$INSTANCE/${file}.jrl" ]]; then
    cat "deployment/$MODE/$INSTANCE/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/$VERSION/${file}.jrl" ]]; then
      cat "deployment/$MODE/$VERSION/${file}.jrl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jrl )
          mv "deployment/$MODE/$VERSION/${file}.jrl" "deployment/$MODE/$VERSION/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/$VERSION/${file}.jrl" ]]; then
      cat "deployment/$MODE/$VERSION/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

  if  [[ -f "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" ]]; then
      cat "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" >> "$OUT_DIR/$journal_file"
      if [[ $IS_AWS -ne 1 ]]; then
        case $f in
          *.jrl )
          mv "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl"
          ;;
        esac
      fi
  elif [[ -f "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" ]]; then
    cat "deployment/$MODE/$INSTANCE/$VERSION/${file}.jrl" >> "$OUT_DIR/$journal_file"
  fi

done

exit 0
