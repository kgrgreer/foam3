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

touch transactions.out
if [ -f "transactions" ]; then
    # CASHIN - bank to digital
    perl -p -i -e 's/(.*?)(net.nanopay.tx.model.Transaction)(.*?)(\"payerId\":)([[:digit:]]+)(.*?\"type\":2.*?)\"bankAccountId\":([[:digit:]]+)(.*?)/localTransactionDAO.\1net.nanopay.tx.alterna.AlternaCITransaction\3\"sourceAccount\":\7\6\8/g;' transactions

    # CASHOUT - digital to bank
    perl -p -i -e 's/(.*?)(net.nanopay.tx.model.Transaction)(.*?)(\"payeeId\":)([[:digit:]]+)(.*?\"type\":1.*?)\"bankAccountId\":([[:digit:]]+)(.*?)/localTransactionDAO.\1net.nanopay.tx.alterna.AlternaCOTransaction\3\"destinationAccount\":\7\6\8/g;' transactions

    # VERIFICATION - not sure what to do with these
    perl -p -i -e 's/(.*?)(net.nanopay.tx.model.Transaction)(.*?\"type\":3.*?)/localTransactionDAO.\1net.nanopay.tx.cico.VerificationTransaction\",\"isQuoted\":true\2/g;' transactions

    # DIGITAL - just let these get quoted and the payerId and payeeId will be mapped to default digital accounts. - do nothing
    #perl -p -i -e 's/(?!\"type\")/localTransactionDAO.\1/g;' transactions
fi
