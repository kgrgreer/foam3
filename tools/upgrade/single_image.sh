#!/bin/bash

NANOPAY_HOME="/opt/nanopay"
JOURNAL_HOME="$NANOPAY_HOME/journals"
IMAGE=/tmp/journals/image.0
mkdir /tmp/journals
touch $IMAGE
for file in $JOURNAL_HOME/*; do
  cat $file >> $IMAGE
done

# backup and replace
mkdir -p $NANOPAY_HOME/journals_bak
cp -r $NANOPAY_HOME/journals/* $NANOPAY_HOME/journals_bak/
rm -r $NANOPAY_HOME/journals/*
cp -r $NANOPAY_HOME/journals_bak/sha256 $NANOPAY_HOME/journals/
cp $IMAGE $JOURNAL_HOME/

exit 0
