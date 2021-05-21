#!/bin/bash

JOURNAL_HOME="/opt/nanopay/journals"
#JOURNAL_HOME="/Users/jhughes/workspace/repos/NANOPAY/tmp/journals"

# Prepend the nspec name to all journal entries in preparation for merging into single journal or image file.
# Creates an array of the file names
declare -a arr=(
  "accounts,localAccountDAO"
  "ascendantfxusers,ascendantFXUserDAO"
  "ascendantUserPayeeJunctions,ascendantUserPayeeJunctionDAO"
  "branches,branchDAO"
  "brokers,brokerDAO"
  "businessSectors,businessSectorDAO"
  "businessTypes,businessTypeDAO"
  "countries,countryDAO"
  "cronjobs,cronDAO"
  "currencies,currencyDAO"
  "currencyfxServices,currencyFXServiceDAO"
  "emailTemplates,emailTemplateDAO"
  "exportDriverRegistrys,exportDriverRegistryDAO"
  "groups,groupDAO"
  "htmlDoc,htmlDocDAO"
  "institutions,institutionDAO"
  "institutionPurposeCodes,institutionPurposeCodeDAO"
  "languages,languageDAO"
  "menus,menuDAO"
  "notificationTemplates,notificationTemplateDAO"
  "payoutOptions,payoutOptionDAO"
  "permissions,permissionDAO"
  "questionnaires,questionnaireDAO"
  "regions,regionDAO"
  "scripts,scriptDAO"
  "reports,reportDAO"
  "services,serviceDAO"
  "spids,serviceProviderDAO"
  "tests,testDAO"
  "transactionfees,transactionFeesDAO"
  "transactionLimits,transactionLimitDAO"
  "transactionPurposes,transactionPurposeDAO"
  "zeroAccountUserAssociations,localZeroAccountUserAssociationDAO"
  "txnProcessors,txnProcessorDAO"
  "users,bareUserDAO"
  "xeroToken,zeroTokenDAO"
  "xeroConfig,zeroConfigDAO"
  )

for i in "${arr[@]}"
do
  arr=(${i//,/ })
  name=${arr[0]}
  dao=${arr[1]}

  echo "name:${name} dao:${dao}"

  if [ -f "$JOURNAL_HOME/$name" ]; then
    perl -p -i -e "s/^p(.*?)/${dao}.p\1/g;" "$JOURNAL_HOME/$name"
  fi
  if [ -f "$JOURNAL_HOME/$name.0" ]; then
    perl -p -i -e "s/^p(.*?)/${dao}.p\1/g;" "$JOURNAL_HOME/$name.0"
  fi
done
exit 0
