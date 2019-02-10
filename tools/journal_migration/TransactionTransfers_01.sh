#!/bin/bash

# Remove transfers on DigitalTransactions

if [ -f "$JOURNAL_HOME/transactions" ]; then
    perl -p -i -e 's/,\"transfers\":\[\{.*\}\]//g;' "$JOURNAL_HOME"/transactions
fi
