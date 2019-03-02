#!/bin/bash

# update http servlet host mapping

JOURNAL_HOME=/opt/nanopay/journals

if [ -f "$JOURNAL_HOME/service" ]; then
    perl -p -i -e 's/(.*?)hostMapping\":{(.*?)}(.*?)/\1hostMapping\":{"portal.ablii.com":"/nanopay/src/net/nanopay/sme/index.html","portal.nanopay.net":"/nanopay/src/net/nanopay/index.html","demo.ablii.com":"/nanopay/src/net/nanopay/sme/index.html","demo.nanopay.net":"/nanopay/src/net/nanopay/index.html"}\3/g;' "$JOURNAL_HOME"/services
fi
if [ -f "$JOURNAL_HOME/service.0" ]; then
    perl -p -i -e 's/(.*?)hostMapping\":{(.*?)}(.*?)/\1hostMapping\":{"portal.ablii.com":"/nanopay/src/net/nanopay/sme/index.html","portal.nanopay.net":"/nanopay/src/net/nanopay/index.html","demo.ablii.com":"/nanopay/src/net/nanopay/sme/index.html","demo.nanopay.net":"/nanopay/src/net/nanopay/index.html"}\3/g;' "$JOURNAL_HOME"/services.0
fi
