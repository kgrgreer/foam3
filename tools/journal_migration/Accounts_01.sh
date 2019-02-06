#!/bin/bash

# migrate enabled:false to deleted:true

export JOURNAL_HOME=/opt/nanopay/journals
if [ -f "$JOURNAL_HOME/accounts" ]; then
    perl -p -i -e 's/(.*?)net.nanopay.account.DigitalAccount(.*?)enabled\":false(.*?)\{\"algorithm.*\}/\1net.nanopay.account.DigitalAccount\2deleted\":true\3/g;' "$JOURNAL_HOME"/accounts
    
fi
if [ -f "$JOURNAL_HOME/accounts" ]; then
    perl -p -i -e 's/(.*?)net.nanopay.bank.CABankAccount(.*?)enabled\":false(.*?)/\1net.nanopay.bank.CABankAccount\2deleted\":true\3/g;' "$JOURNAL_HOME"/accounts
    
fi

# /,{"algorithm":.*}//
