#!/bin/bash

# Migrate all existing account entries to have a new account.lifecycleState property
# which will be set to ACTIVE (ordinal 1)

# if $JOURNAL_HOME echo's blank then uncomment the bottom line
export JOURNAL_HOME="/opt/nanopay/journals"

echo "Initializing LifecycleStateAccount.sh migration script"
echo "Current JOURNAL_HOME is: $JOURNAL_HOME"
echo "==================================================================="

echo "Looking for $JOURNAL_HOME/accounts ..."

if [ -f "$JOURNAL_HOME/accounts" ]
then
    echo "Found $JOURNAL_HOME/accounts"
    echo "Stripping digest..."
    perl -p -i -e 's/},\{\"algorithm\":(.*)}/}/g;' "$JOURNAL_HOME"/accounts
    echo "Finished stripping digest..."

    echo "Migrating $JOURNAL_HOME/accounts ..."
    # If somehow the journals already have lifecycleState, we will remove it first
    # case 1: if at the end of the entry
    perl -p -i -e 's/,\"lifecycleState\":[0-9]}/}/g;' "$JOURNAL_HOME"/accounts
    # case 2: if somewhere in within the entry
    perl -p -i -e 's/,\"lifecycleState\":[0-9],/,/g;' "$JOURNAL_HOME"/accounts
    
    # Finally appending the actual lifecycleState value at the end of the entry
    perl -p -i -e 's/}\)/,\"lifecycleState\":1}\)/g;' "$JOURNAL_HOME"/accounts

    echo "Finished migrating $JOURNAL_HOME/accounts"
else
    echo "Could not find $JOURNAL_HOME/accounts"
fi

echo "-------------------------------------------------------------------"

echo "Looking for $JOURNAL_HOME/bankAccounts ..."

if [ -f "$JOURNAL_HOME/bankAccounts" ]
then
    echo "Found $JOURNAL_HOME/bankAccounts"
    echo "Stripping digest..."
    perl -p -i -e 's/},\{\"algorithm\":(.*)}/}/g;' "$JOURNAL_HOME"/bankAccounts
    echo "Finished stripping digest..."

    echo "Migrating $JOURNAL_HOME/bankAccounts ..."

    # If somehow the journals already have lifecycleState, we will remove it first
    # case 1: if at the end of the entry
    perl -p -i -e 's/,\"lifecycleState\":[0-9]}/}/g;' "$JOURNAL_HOME"/bankAccounts
    # case 2: if somewhere in within the entry
    perl -p -i -e 's/,\"lifecycleState\":[0-9],/,/g;' "$JOURNAL_HOME"/bankAccounts

    # Finally appending the actual lifecycleState value at the end of the entry
    perl -p -i -e 's/}\)/,\"lifecycleState\":1}\)/g;' "$JOURNAL_HOME"/bankAccounts

    echo "Finished migrating $JOURNAL_HOME/bankAccounts"
else 
    echo "Could not find $JOURNAL_HOME/bankAccounts"
fi

echo "==================================================================="
echo "End of LifecycleStateAccount.sh migration script"
