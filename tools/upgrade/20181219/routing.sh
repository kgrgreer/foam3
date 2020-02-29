#!/bin/bash

# migrate service JDAO to RoutingJDAO entries

#JOURNAL_HOME=/opt/nanopay/journals
JOURNAL_HOME=~/workspace/repos/NANOPAY/tmp/journals

if [ -f "$JOURNAL_HOME/services.0" ]; then
    perl -p -i -e 's/^/p({"class":"foam.nanos.boot.NSpec", "name":"routingJournal",  "lazy":false,  "serviceScript":"new foam.dao.RoutingJournal.Builder(x).setFile(\"journal\").build()"})\n/' "$JOURNAL_HOME"/services.0

    perl -p -i -e 's/(.*?)new foam.dao.JDAO\(x,(.*?),[ ]{0,}\"(.*?)\"\)(.*?)/\1 new foam.dao.RoutingJDAO.Builder(x).setService(\"\3\").setOf(\3).setDelegate().setJournal((foam.dao.Journal) x.get("routingJournal")).build()\4/g;' "$JOURNAL_HOME"/services.0
fi
if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/(.*?)new foam.dao.JDAO\(x,(.*?),[ ]{0,}\"(.*?)\"\)(.*?)/\1 new foam.dao.RoutingJDAO.Builder(x).setService(\"\3\").setOf(\3).setDelegate().setJournal((foam.dao.Journal) x.get("routingJournal")).build()\4/g;' "$JOURNAL_HOME"/services
fi
