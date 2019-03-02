#!/bin/bash

# Migrate foam.dao.JDAO to foam.dao.java.JDAO

if [ -f "$JOURNAL_HOME/services.0" ]; then
    perl -p -i -e 's/foam\.dao\.JDAO/foam.dao.java.JDAO/g;' "$JOURNAL_HOME"/services.0
fi

if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/foam\.dao\.JDAO/foam.dao.java.JDAO/g;' "$JOURNAL_HOME"/services
fi
