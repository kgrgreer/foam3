#!/bin/bash

# Migrate user phone numbers:
#   phone -> phoneNumber, phoneNumberVerified
#   mobile -> mobileNumber, mobileNumberVerified
#   businessPhone -> businessPhoneNumber, businessPhoneNumberVerified

echo "Initializing Users_04.sh migration script"
echo "Current JOURNAL_HOME is: $JOURNAL_HOME"
echo "==================================================================="

if [ -f "$JOURNAL_HOME/users" ]; then
  perl -p -i -e '
s/,("phone":\{"class":"foam\.nanos\.auth\.Phone".*),"number":"(\d+)"/,"phoneNumber":"\2",\1/g;
s/,("phone":\{"class":"foam\.nanos\.auth\.Phone".*),"verified":(true|false)/,"phoneNumberVerified":\2,\1/g;
s/,"phone":\{"class":"foam\.nanos\.auth\.Phone"\}//g;' "$JOURNAL_HOME"/users

  perl -p -i -e '
s/,("mobile":\{"class":"foam\.nanos\.auth\.Phone".*),"number":"(\d+)"/,"mobileNumber":"\2",\1/g;
s/,("mobile":\{"class":"foam\.nanos\.auth\.Phone".*),"verified":(true|false)/,"mobileNumberVerified":\2,\1/g;
s/,"mobile":\{"class":"foam\.nanos\.auth\.Phone"\}//g;' "$JOURNAL_HOME"/users

  perl -p -i -e '
s/,("businessPhone":\{"class":"foam\.nanos\.auth\.Phone".*),"number":"(\d+)"/,"businessPhoneNumber":"\2",\1/g;
s/,("businessPhone":\{"class":"foam\.nanos\.auth\.Phone".*),"verified":(true|false)/,"businessPhoneNumberVerified":\2,\1/g;
s/,"businessPhone":\{"class":"foam\.nanos\.auth\.Phone"\}//g;' "$JOURNAL_HOME"/users

  echo "Finished migrating phone numbers in $JOURNAL_HOME/users"
else
  echo "Could not find $JOURNAL_HOME/users"
fi

echo "==================================================================="
echo "End of Users_04.sh migration script"
