#!/bin/bash

# Migrate TransactionPurpose:
# - package model -> ..

if [ -f "$JOURNAL_HOME/transactionPurposes" ]; then
    perl -p -i -e 's/net\.nanopay\.tx\.model\.TransactionPurpose/net\.nanopay\.tx\.TransactionPurpose/g;' "$JOURNAL_HOME"/transactionPurposes
fi
