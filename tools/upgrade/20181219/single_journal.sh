#!/bin/bash

NANOPAY_HOME="/opt/nanopay"
JOURNAL_HOME="$NANOPAY_HOME/journals"
JOURNAL=/tmp/journals/journal.0
mkdir /tmp/journals
touch $JOURNAL
for file in $JOURNAL_HOME/*; do
  cat $file >> $JOURNAL
done

# backup and replace
mkdir -p $NANOPAY_HOME/journals_bak
cp -r $NANOPAY_HOME/journals/* $NANOPAY_HOME/journals_bak/
rm -r $NANOPAY_HOME/journals/*
cp -r $NANOPAY_HOME/journals_bak/sha256 $NANOPAY_HOME/journals/
cp $JOURNAL $JOURNAL_HOME/

exit 0
