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

# Sets varuables to lowercase
INSTANCE=$(echo "$INSTANCE" | tr '[:upper:]' '[:lower:]')

echo "INFO :: $0 IN_DIR=${IN_DIR} OUT_DIR=${OUT_DIR} INSTANCE=${INSTANCE}"

# Creates an array of the file names
declare -a arr=(
  "acceptanceDocuments"
  "accounts"
  "afexBeneficiaries"
  "afexBusinesses"
  "alarmConfig"
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
rm ${OUT_DIR}/*.0

while read -r filePath; do
  # Add a comment in the journal to indicate the source of the lines that follow
  # in the .0 file.
  echo "// The following $(wc -l < ${filePath} | tr -d ' ') lines were copied from \"${filePath}\"" >> ${OUT_DIR}/"$(basename "${filePath%.jrl}")".0

  # Append the journal entries from the current file to the .0 file.
  cat ${filePath} >> ${OUT_DIR}/"$(basename "${filePath%.jrl}")".0

  # Add a newline if one is missing so we don't put two journal entries on
  # the same line.
  test "$(tail -c 1 "${filePath}" | wc -l)" -eq 0 && echo "" >> ${OUT_DIR}/"$(basename "${filePath%.jrl}")".0
done < ${IN_FILE:-/dev/stdin}

exit 0
