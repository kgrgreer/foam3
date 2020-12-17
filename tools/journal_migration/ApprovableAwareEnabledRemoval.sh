#!/bin/bash

# Remove approvableAwareEnabled setters from nspec entries in the journals

export JOURNAL_HOME="/opt/nanopay/journals"

echo "Initializing ApprovableAwareEnabledRemoval.sh migration script"
echo "Current JOURNAL_HOME is: $JOURNAL_HOME"
echo "==================================================================="

echo "Looking for $JOURNAL_HOME/services ..."

if [ -f "$JOURNAL_HOME/services" ]
then
    echo "Found $JOURNAL_HOME/services"
    echo "Migrating $JOURNAL_HOME/services ..."

    perl -p -i -e 's/\.setApprovableAwareEnabled\([^\)]*\)//g; s/^\s+\n+//g;' "$JOURNAL_HOME"/services

    echo "Finished migrating $JOURNAL_HOME/services"
else
    echo "Could not find $JOURNAL_HOME/services"
fi

echo "==================================================================="
echo "End of ApprovableAwareEnabledRemoval.sh migration script"
