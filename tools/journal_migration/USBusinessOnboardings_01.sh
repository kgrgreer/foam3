#!/bin/bash

# Migrate usBusinessOnboarding phone number:
#   phone -> phoneNumber

echo "Initializing USBusinessOnboarding_01.sh migration script"
echo "Current JOURNAL_HOME is: $JOURNAL_HOME"
echo "==================================================================="

if [ -f "$JOURNAL_HOME/usBusinessOnboardingDAO" ]; then
  perl -p -i -e '
s/,("phone":\{"class":"foam\.nanos\.auth\.Phone".*),"number":"(\d+)"/,"phoneNumber":"\2",\1/g;
s/,"phone":\{"class":"foam\.nanos\.auth\.Phone"\}//g;' "$JOURNAL_HOME"/usBusinessOnboardingDAO

  echo "Finished migrating phone numbers in $JOURNAL_HOME/usBusinessOnboardingDAO"
else
  echo "Could not find $JOURNAL_HOME/usBusinessOnboardingDAO"
fi

echo "==================================================================="
echo "End of USBusinessOnboarding_01.sh migration script"
