#!/bin/bash

# Migrate ApprovalRequests: remove entityId

echo "Initializing ApprovalRequest_02.sh migration script"
echo "Current JOURNAL_HOME is: $JOURNAL_HOME"
echo "==================================================================="

if [ -f "$JOURNAL_HOME/approvalRequests" ]; then
  perl -p -i -e 's/,entityId:\d+//g;' "$JOURNAL_HOME"/approvalRequests

  echo "Finished migrating phone numbers in $JOURNAL_HOME/approvalRequests"
else
  echo "Could not find $JOURNAL_HOME/approvalRequests"
fi

echo "==================================================================="
echo "End of ApprovalRequest_02.sh migration script"
