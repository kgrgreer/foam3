#!/bin/bash

# model.BankAccount -> bank.BankAccount

if [ -f "$JOURNAL_HOME/bankAccounts" ]; then
    perl -p -i -e 's/accountName/name/g;s/transitNumber/branchId/g;s/currencyCode/denomination/g;s/setAsDefault/isDefault/g;' "$JOURNAL_HOME"/bankAccounts
fi
