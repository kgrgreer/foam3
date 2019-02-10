#!/bin/bash

# migrate service JDAO to RoutingJDAO entries

JOURNAL_HOME=/opt/nanopay/journals
#JOURNAL_HOME=~/workspace/repos/NANOPAY/tmp/journals

if [ -f "$JOURNAL_HOME/services.0" ]; then
    perl -p -i -e 's/(.*?)new foam.dao.JDAO\(x,(.*?)\"(.*?)\"\)(.*?)/\1new net.nanopay.security.snapshooter.RollingJournal.Builder(x).setDelegate(new foam.dao.FileJournal.Builder(x).setFile(foam.dao.RollingJournal.getNextJournal()).build()).setJournalNumber(foam.dao.RollingJournal.getNextJournalNumber()).build()\4/g;' "$JOURNAL_HOME"/services.0
fi
if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/(.*?)new foam.dao.JDAO\(x,(.*?)\"(.*?)\"\)(.*?)/\1new net.nanopay.security.snapshooter.RollingJournal.Builder(x).setDelegate(new foam.dao.FileJournal.Builder(x).setFile(foam.dao.RollingJournal.getNextJournal()).build()).setJournalNumber(foam.dao.RollingJournal.getNextJournalNumber()).build()\4/g;' "$JOURNAL_HOME"/services
fi
