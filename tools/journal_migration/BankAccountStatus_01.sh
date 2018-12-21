#!/bin/bash

# Migrate BankAccount.status Strings to BankAccountStatus enums

if [ -f "$JOURNAL_HOME/bankAccounts" ]; then
    perl -p -i -e 's/status\":\"Unverified\"/status\":0/; s/status\":\"Verified\"/status\":1/; s/status:\":\"Disabled\"/status\":2/g;' "$JOURNAL_HOME"/bankAccounts
fi
# execute on both in case BankAccounts_01.sh runs first.
if [ -f "$JOURNAL_HOME/accounts" ]; then
    perl -p -i -e 's/status\":\"Unverified\"/status\":0/; s/status\":\"Verified\"/status\":1/; s/status:\":\"Disabled\"/status\":2/g;' "$JOURNAL_HOME"/accounts
fi
