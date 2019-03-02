#!/bin/bash

# Transaction

if [ -f "$JOURNAL_HOME/transactions" ]; then
    perl -p -i -e 's/date/completionDate/g;' "$JOURNAL_HOME"/transactions
fi
