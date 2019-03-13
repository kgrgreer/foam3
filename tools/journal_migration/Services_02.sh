#!/bin/bash

# correct paths in services for jar file deployment
# Enable when deploying from jars.  NOTE: to run again at that time, remove /opt/0
exit 0

export JOURNAL_HOME=/opt/nanopay/journals
if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/pathSpec\":\"\/images\/\*\",initParameters:\{\"paths\":\".*\"\}\},/pathSpec\":\"\/images\/\*\",initParameters:\{\"paths\":\"images\"\}\},/g;' "$JOURNAL_HOME"/services
fi

if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/\/nanopay\/src\/net\/nanopay\/error.html/\/errorPage.html/g;' "$JOURNAL_HOME"/services
fi

if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/\/nanopay\/src\/net\/nanopay\/index.html/\/index.html/g; s/\/nanopay\/src\/net\/nanopay\/sme\/index.html/\/ablii.html/g; s/\/nanopay\/src\/net\/nanopay\/merchant\/index.html/\/merchant.html/g;' "$JOURNAL_HOME"/services
fi

if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/servlet\.ImageServlet/servlet\.ResourceImageServlet/g;' "$JOURNAL_HOME"/services
fi
