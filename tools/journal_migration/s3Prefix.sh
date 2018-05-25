#!/bin/bash

# Remove S3 Prefixes

perl -p -i -e 's/id\":\"PRODUCTION\//id\":/g; s/id\":\"DEVELOPMENT\//id\":/g; s/id\":\"STAGING\//id\":/g; s/id\":\"DEMO\//id\":/g' "$JOURNAL_HOME/files" "$JOURNAL_HOME/invoiceHistory" "$JOURNAL_HOME/invoices" "$JOURNAL_HOME/userHistory" "$JOURNAL_HOME/users" 2>/dev/null
