#!/bin/bash

# Transaction - payerId payeeId to Accounts.
# TransactionStatus:
#   0 - PENDING (0)
#   1 - REVERSE
#   2 - REVERSE_FAIL
#   3 - SENT (1)
#   4 - DECLINED (2)
#   5 - COMPLETED (3)

# TransactionType:
#   0 - NONE
#   1 - CASHOUT
#   2 - CASHIN
#   3 - VERFICATION
#   4 - BANK_ACCOUNT_PAYMENT (appears to be the same as CASHIN when looking at code use.)
#   5 - REFUND

# When Type:
#   0 - digital need default CAD digital for both - which we don't have pre-migration. manually create them now and then have ids.
#   1 - bankAccountId -> payeeAccountId
#   2 - bankAccountId -> payerAccountId

# NOTE: see TransactionSourceDestination.pl for translation of source/destinationBankAccount

export JOURNAL_HOME=/opt/nanopay/journals
if [ -f "$JOURNAL_HOME/transactions" ]; then
    # CASHIN - bank to digital
    # BANK_ACCOUNT_PAYMENT
    perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\",)(.*?)(\"payerId\":)([[:digit:]]+)(.*?\"type\":[2|4].*?),\"bankAccountId\":([[:digit:]]+)(.*?)/\1\"net.nanopay.tx.alterna.AlternaCITransaction\",\3\"sourceBankAccount\":\7\6\8/g;' "$JOURNAL_HOME/"transactions

    # CASHOUT - digital to bank
    perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\",)(.*?)(\"payeeId\":)([[:digit:]]+)(.*?\"type\":1.*?),\"bankAccountId\":([[:digit:]]+)(.*?)/\1\"net.nanopay.tx.alterna.AlternaCOTransaction\",\3\"destinationBankAccount\":\7\6\8/g;' "$JOURNAL_HOME/"transactions

    # BANK_ACCOUNT_PAYMENT
    #perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\",)(.*?)(\"payeeId\":)([[:digit:]]+)(.*?\"type\":4.*?),\"bankAccountId\":([[:digit:]]+)(.*?)/\1\"net.nanopay.tx.alterna.AlternaCOTransaction\",\3\"destination_Bank_Account\":\5\6\8/g;' "$JOURNAL_HOME/"transactions

    # VERIFICATION - not sure what to do with these
    perl -p -i -e 's/(.*?)(\"net.nanopay.tx.model.Transaction\")(.*?\"type\":3.*?)/\1\"net.nanopay.tx.cico.VerificationTransaction\"\3/g;' "$JOURNAL_HOME/"transactions

    # Other - discard all but cash-in, cash-out, verification
    #sed -i '/payerId/!d' "$JOURNAL_HOME/transactions"
    perl -ne 'print if /paye[er]Id/' "$JOURNAL_HOME/transactions" > "$JOURNAL_HOME/transactions.out"
    mv "$JOURNAL_HOME/transactions.out" "$JOURNAL_HOME/transactions"

    # Whatever is remaining is Digital
    perl -p -i -e 's/net.nanopay.tx.model.Transaction/net.nanopay.tx.DigitalTransaction/g;' "$JOURNAL_HOME/"transactions

    # Set sourceCurrency
    perl -p -i -e 's/(.*?)id\":(.*?),(.*?)/\1id\":\2,\"sourceCurrency\":\"CAD\",\3/g;' "$JOURNAL_HOME/"transactions

    # copy data to createdDate and lastModifiedDate
    perl -p -i -e 's/date\":\"(.*?)\"/date\":\"\1\",\"created\":\"\1\",\"lastModified\":\"\1\"/g;' "$JOURNAL_HOME/"transactions

    # status to complete
    perl -p -i -e 's/status\":(\d+)/status\":5/g;' "$JOURNAL_HOME/"transactions
fi

