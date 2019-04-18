#!/bin/bash

# Append authenticated:false to all documents. Should be run once

if [ -f "$JOURNAL_HOME/acceptanceDocuments" ]; then
    perl -p -i -e 's/class\":\"net.nanopay.documents.AcceptanceDocument\"/class\":\"net.nanopay.documents.AcceptanceDocument\",\"authenticated\":false/g;' "$JOURNAL_HOME"/acceptanceDocuments
fi
