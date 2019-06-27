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

# Creates an array of the file names
declare -a arr=(
  "acceptanceDocuments"
  "accounts"
  "alarmConfig"
  "afexBeneficiaries"
  "afexBusinesses"
  "ascendantfxusers"
  "ascendantUserPayeeJunctions"
  "blacklists"
  "branches"
  "brokers"
  "businessSectors"
  "businessTypes"
  "complianceItems"
  "corridors"
  "countries"
  "cronjobs"
  "currencies"
  "currencyfxServices"
  "dugs"
  "emailTemplates"
  "exportDriverRegistrys"
  "fundTransferSystems"
  "groupPermissionJunctions"
  "groups"
  "htmlDoc"
  "identificationTypes"
  "institutionPurposeCodes"
  "institutions"
  "keyPairs"
  "languages"
  "lineItemFees"
  "lineItemTax"
  "lineItemTypeAccounts"
  "lineItemTypes"
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
  "themes"
  "transactionfees"
  "transactionLimits"
  "transactionPurposes"
  "transactions"
  "txnProcessors"
  "users"
  "xeroConfig"
  "xeroToken"
  "zeroAccountUserAssociations"
  )

# Array of source directories
declare -a sources=(
  "foam2/src"
  "nanopay/src"
 # "interac/src"
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

  # non .jrl files
  # Recursively go through the directory and find if the files exists.
  # If they do, then concatenate the files into one.
  for s in ${sources[*]}
  do
    for f in $(find $s -name "$file")
    do
        cat $f >> "$OUT_DIR/$journal_file"
    done
    for f in $(find $s -name "${file}.jrl")
    do
      cat "$f" >> "$OUT_DIR/$journal_file"
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

exit 0
