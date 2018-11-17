#!/bin/bash

# model.BankAccount -> bank.BankAccount


if [ -f "$JOURNAL_HOME/bankAccounts" ]; then
    perl -p -i -e 's/net.nanopay.model.BankAccount/net.nanopay.bank.CABankAccount/g;s/accountName/name/g;s/transitNumber/branchId/g;s/currencyCode/denomination/g;s/setAsDefault/isDefault/g;' "$JOURNAL_HOME"/bankAccounts
    mv "$JOURNAL_HOME/bankAccounts" "$JOURNAL_HOME/accounts"
fi
