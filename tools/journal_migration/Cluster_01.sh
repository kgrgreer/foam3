#!/bin/bash

# Migrate Institution:
# - BIC -> bankIdentificationCode
# - institution -> name

if [ -f "$JOURNAL_HOME/institutions" ]; then
    perl -p -i -e 's/net\.nanopay\.model\.Institution/net\.nanopay\.payment\.Institution/; s/BIC/bankIdentificationCode/; s/\"institution\"/\"name\"/g;' "$JOURNAL_HOME"/institutions
fi
