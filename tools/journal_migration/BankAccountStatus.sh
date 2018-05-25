#!/bin/bash

# Migrate BankAccount.status Strings to BankAccountStatus enums

if [ -f "$JOURNAL_HOME/bankAccounts" ]; then
    perl -p -i -e 's/status\":\"UNVERIFIED\"/status\":0/g; s/status\":\"VERIFIED\"/status\":1/g; s/status:\":\"DISABLED\"/status\":2/g;' "$JOURNAL_HOME"/bankAccounts
fi
