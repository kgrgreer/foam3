#!/bin/bash

# Transaction - payerId payeeId to Accounts.
# TransactionStatus:
#   0 - PENDING
#   1 - SENT
#   2 - DECLINED
#   3 - COMPLETED

# TransactionType:
#   0 - NONE
#   1 - CASHOUT
#   2 - CASHIN
#   3 - VERFICATION

# When Type:
#   0 - digital need default CAD digital for both - which we don't have pre-migration. manually create them now and then have ids.
#   1 - bankAccountId -> payeeAccountId
#   2 - bankAccountId -> payerAccountId
export JOURNAL_HOME=/opt/nanopay/journals
if [ -f "$JOURNAL_HOME/transactions" ]; then
    # CASHIN - bank to digital
    perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\",)(.*?)(\"payerId\":)([[:digit:]]+)(.*?\"type\":2.*?),\"bankAccountId\":([[:digit:]]+)(.*?)/\1\"net.nanopay.tx.alterna.AlternaCITransaction\",\3\"sourceAccount\":\7\6\8/g;' "$JOURNAL_HOME/"transactions

    # CASHOUT - digital to bank
    perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\",)(.*?)(\"payeeId\":)([[:digit:]]+)(.*?\"type\":1.*?),\"bankAccountId\":([[:digit:]]+)(.*?)/\1\"net.nanopay.tx.alterna.AlternaCOTransaction\",\3\"destinationAccount\":\7\6\8/g;' "$JOURNAL_HOME/"transactions

    # VERIFICATION - not sure what to do with these
    perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\")(.*?\"type\":3.*?)/\1\"net.nanopay.tx.cico.VerificationTransaction\"\3/g;' "$JOURNAL_HOME/"transactions

    # DIGITAL - just let these get quoted and the payerId and payeeId will be mapped to default digital accounts. - do nothing
    #perl -p -i -e 's/(?!\"type\")/\1/g;' "$JOURNAL_HOME/"transactions

    # Other - discard all but cash-in, cash-out, verification
    #sed -i '/payerId/!d' "$JOURNAL_HOME/transactions"
    perl -ne 'print if /paye[er]Id/' "$JOURNAL_HOME/transactions" > "$JOURNAL_HOME/transactions.out"
    mv "$JOURNAL_HOME/transactions.out" "$JOURNAL_HOME/transactions"

    # Whatever is remaining is Digital
    perl -p -i -e 's/net.nanopay.tx.model.Transaction/net.nanopay.tx.DigitalTransaction/g;' "$JOURNAL_HOME/"transactions

    # Set isQuoted flag
    perl -p -i -e 's/(.*?)id\":(.*?),(.*?)/\1id\":\2,\"isQuoted\":true,\3/g;' "$JOURNAL_HOME/"transactions

fi
