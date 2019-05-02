#!/bin/bash

#accouting contact email cache
if [ -f "$JOURNAL_HOME/accountingContactEmailCache" ]; then
    perl -p -i -e 's/net.nanopay.integration/net.nanopay.accounting/g;' "$JOURNAL_HOME"/accountingContactEmailCache
fi

#xeroConfig.0
if [ -f "$JOURNAL_HOME/xeroConfig.0" ]; then
    perl -p -i -e 's/net.nanopay.integration/net.nanopay.accounting/g;' "$JOURNAL_HOME"/xeroConfig.0
fi

#xeroConfig
if [ -f "$JOURNAL_HOME/xeroConfig" ]; then
    perl -p -i -e 's/net.nanopay.integration/net.nanopay.accounting/g;' "$JOURNAL_HOME"/xeroConfig
fi

#xeroToken
if [ -f "$JOURNAL_HOME/xeroToken" ]; then
    perl -p -i -e 's/net.nanopay.integration/net.nanopay.accounting/g;' "$JOURNAL_HOME"/xeroToken
fi

#rm quickbooksConfig.0
if [ -f "$JOURNAL_HOME/quickbooksConfig.0" ]; then
    rm $JOURNAL_HOME/quickbooksConfig.0
fi

#rm quickbooksConfig
if [ -f "$JOURNAL_HOME/quickbooksConfig" ]; then
    rm $JOURNAL_HOME/quickbooksConfig
fi

#rm quickbooksToken.0
if [ -f "$JOURNAL_HOME/quickbooksToken.0" ]; then
    rm $JOURNAL_HOME/quickbooksToken.0
fi

#rm quickbooksToken
if [ -f "$JOURNAL_HOME/quickbooksToken" ]; then
    rm $JOURNAL_HOME/quickbooksToken
fi
    
#quickConfig
if [ -f "$JOURNAL_HOME/quickConfig" ]; then
    mv $JOURNAL_HOME/quickConfig $JOURNAL_HOME/quickbooksConfig
    perl -p -i -e 's/net.nanopay.integration.quick.QuickConfig/net.nanopay.accounting.quickbooks.QuickbooksConfig/g;' "$JOURNAL_HOME"/quickbooksConfig
fi

#quickConfig.0
if [ -f "$JOURNAL_HOME/quickConfig.0" ]; then
    mv $JOURNAL_HOME/quickConfig.0 $JOURNAL_HOME/quickbooksConfig.0
    perl -p -i -e 's/net.nanopay.integration.quick.QuickConfig/net.nanopay.accounting.quickbooks.QuickbooksConfig/g;' "$JOURNAL_HOME"/quickbooksConfig.0
fi

if [ -f "$JOURNAL_HOME/quickToken" ]; then
    rm $JOURNAL_HOME/quickToken
fi

if [ -f "$JOURNAL_HOME/quickToken.0" ]; then
    rm $JOURNAL_HOME/quickToken.0
fi

if [ -f "$JOURNAL_HOME/xeroToken" ]; then
    rm $JOURNAL_HOME/xeroToken
fi
