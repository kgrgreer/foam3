# Concatenate JDAO files from subdirectories into one JDAO

# Creates an array of the file names 
declare -a arr=("brokers" "businessSectors" "businessTypes" "cicoServiceProviders" "countries" "cronjobs" "currencies" "corridors" "payoutOptions" "transactionPurposes" "dugs" "emailTemplates" "exportDriverRegistrys" "groups" "institutions" "languages" "menus" "permissions" "questionnaireQuestionJunction" "questionnaires" "questions" "regions" "scripts" "services" "spids" "tests" "transactionLimits" "users" )

# Go through the array and check each location for the file and concatenate into one JDAO
for file in "${arr[@]}"
do
  find foam2/src -type f -name $file -exec cat {} \; > $file
  find nanopay/src -type f -name $file -exec cat {} \; >> $file
  find interac/src -type f -name $file -exec cat {} \; >> $file
  find deployment -maxdepth 1 -type f -name $file -exec cat {} \; >> $file

  # Checks if parameter 1 directory exists, if so grabs the file from there
  if  [[ -d "deployment/$1" ]]; then
      find deployment/$1 -maxdepth 1 -type f -name $file -exec cat {} \; >> $file
  fi
  
  # Checks if parameter 2 directory exists within parameter 1 directory, if so grabs the file from there
  if  [[ -d "deployment/$1/$2" ]]; then
      find deployment/$1/$2 -maxdepth 1 -type f -name $file -exec cat {} \; >> $file
  fi 
    
  # Checks if parameter 3 directory exists within parameter 2 directory, if so grabs the file from there
  if  [[ -d "deployment/$1/$2/$3" ]]; then
    find deployment/$1/$2/$3 -maxdepth 1 -type f -name $file -exec cat {} \; >> $file
  fi
  

done
