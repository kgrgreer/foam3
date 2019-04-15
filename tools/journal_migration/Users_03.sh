#!/bin/bash

# Fix missing "})p({"

if [ -f "$JOURNAL_HOME/users" ]; then
    perl -p -i -e 's/}{/})\np({/' "$JOURNAL_HOME"/users

fi
