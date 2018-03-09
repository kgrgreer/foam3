# Concatenate JDAO files from subdirectories into one JDAO
MODE
INSTANCE
VERSION

# Creates an array of the file names 
declare -a arr=( 
  "brokers"
  "businessSectors"
  "businessTypes"
  "cicoServiceProviders"
  "corridors"
  "countries"
  "cronjobs"
  "currencies"
  "dugs"
  "emailTemplates"
  "exportDriverRegistrys"
  "groups"
  "institutions"
  "languages"
  "menus"
  "payoutOptions"
  "permissions"
  "questionnaireQuestionJunction"
  "questionnaires"
  "questions"
  "regions"
  "scripts"
  "services"
  "spids"
  "tests"
  "transactionLimits"
  "transactionPurposes"
  "users"
  )

# Go through the array and check each location for the file and concatenate into one JDAO
for file in "${arr[@]}"
do
  # Emptys the file
   > $file
  # Checks if file exists, if so grabs the file from there
  if  [[ -f "foam2/src/$file" ]]; then
      cat foam2/src/$file >> $file
  fi
  if  [[ -f "nanopay/src/$file" ]]; then
      cat nanopay/src/$file >> $file
  fi
  if  [[ -f "interac/src/$file" ]]; then
      cat interac/src/$file >> $file
  fi
  if  [[ -f "deployment/$file" ]]; then
      cat deployment/$file >> $file
  fi
MODE='DEVELOPMENT'
MODE='DEVELOPMENT'
  fi
MODE='DEVELOPMENT'
MODE='DEVELOPMENT'
  fi
MODE='DEVELOPMENT'
MODE='DEVELOPMENT'
  fi
MODE='DEVELOPMENT'
MODE='DEVELOPMENT'
  fi

done
