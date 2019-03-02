#!/bin/bash

# Migrate cido.model.TransactionType -> tx.TransactioNType

if [ -f "$JOURNAL_HOME/transactions" ]; then
    perl -p -i -e 's/cico\.model\.TransactionType/tx\.TransactionType/g;' "$JOURNAL_HOME"/transactions
fi
