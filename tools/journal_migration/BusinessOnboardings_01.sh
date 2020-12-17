#!/bin/bash

# Migrate businessOnboarding phone number:
#   phone -> phoneNumber

echo "Initializing BusinessOnboarding_01.sh migration script"
echo "Current JOURNAL_HOME is: $JOURNAL_HOME"
echo "==================================================================="

if [ -f "$JOURNAL_HOME/businessOnboardingDAO" ]; then
  perl -p -i -e '
s/,("phone":\{"class":"foam\.nanos\.auth\.Phone".*),"number":"(\d+)"/,"phoneNumber":"\2",\1/g;
s/,"phone":\{"class":"foam\.nanos\.auth\.Phone"\}//g;' "$JOURNAL_HOME"/businessOnboardingDAO

  echo "Finished migrating phone numbers in $JOURNAL_HOME/businessOnboardingDAO"
else
  echo "Could not find $JOURNAL_HOME/businessOnboardingDAO"
fi

echo "==================================================================="
echo "End of BusinessOnboarding_01.sh migration script"
