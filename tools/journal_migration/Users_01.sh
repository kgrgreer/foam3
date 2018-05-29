#!/bin/bash

# Set enabled flag of all existing users.

if [ -f "$JOURNAL_HOME/users" ]; then
    perl -p -i -e 's/enabled\":false/enabled\":true/g;' "$JOURNAL_HOME"/users
fi
