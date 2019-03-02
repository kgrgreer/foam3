#!/bin/bash

# Correct missing spid, remove some test groups

if [ -f "$JOURNAL_HOME/users" ]; then
    perl -p -i -e 's/spid\":\"undefined\"/spid\":\"nanopay\"/g;s/spid\":\"\"/spid\":\"nanopay\"/' "$JOURNAL_HOME"/users

    # remove Payer Only and Recieve Only groups
    perl -p -i -e 's/group\":\"\"/group\":\"business\"/g;s/group\":\"Payer Only\"/group\":\"business\"/g;s/group\":\"Receive Only\"/group\":\"business\"/g' "$JOURNAL_HOME"/users

fi
