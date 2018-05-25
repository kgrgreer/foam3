#!/bin/bash

# Migrate BankAccount.status Strings to BankAccountStatus enums

if [ -f "$JOURNAL_HOME/bankAccounts" ]; then
    perl -p -i'.bck' -e 's/status\":\"Unverified\"/status\":0/; s/status\":\"Verified\"/status\":1/; s/status:\":\"Disabled\"/status\":2/g;' "$JOURNAL_HOME"/bankAccounts
fi
