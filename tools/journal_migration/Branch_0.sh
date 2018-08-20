#!/bin/bash

# Migrate Branch
# - name -> institutionId (NOTE: Must be done manually)
# - remove: BIC
# - remove: financialId
# - remove: memberIdentification

if [ -f "$JOURNAL_HOME/branches" ]; then
    perl -p -i -e 's/\"BIC\":\"\",//; s/\"memberIdentification\":\"\",//; s/\"financialId\":\"\",//g;' "$JOURNAL_HOME"/branches
fi
