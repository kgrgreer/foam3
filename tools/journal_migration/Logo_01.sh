#!/bin/bash

# Migrate Nanopay logo from white to blue

if [ -f "$JOURNAL_HOME/emailTemplates" ]; then
    perl -p -i -e 's/nanopay_logo_white/nanopay_blue_white_206x42/g;' "$JOURNAL_HOME"/emailTemplates
fi
if [ -f "$JOURNAL_HOME/groups" ]; then
    perl -p -i -e 's/nanopay_logo_white/nanopay_blue_white_206x42/g;' "$JOURNAL_HOME"/groups
fi
