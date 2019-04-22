#!/bin/bash

# Fix missing "})p({"

if [ -f "$JOURNAL_HOME/users" ]; then
    echo JOURNAL_HOME = $JOURNAL_HOME
    perl -p -i -e 's/}{/})\np({/' "$JOURNAL_HOME/users"

# remove corrupted file
    sed -i.bak '/id\":id\"/d' "$JOURNAL_HOME/users"
    rm "$JOURNAL_HOME/users.bak"
fi
