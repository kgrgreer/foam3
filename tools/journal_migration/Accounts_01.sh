#!/bin/bash

# migrate enabled:false to deleted:true

export JOURNAL_HOME=/opt/nanopay/journals
if [ -f "$JOURNAL_HOME/accounts" ]; then
    perl -p -i -e 's/enabled\":false/deleted\":true/g;' "$JOURNAL_HOME"/accounts
fi
