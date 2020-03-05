#!/bin/bash

# migrate ApprovalRequests from nanopay to foam

JOURNAL_HOME="/opt/nanopay/journals"

if [ -f "$JOURNAL_HOME/approvalRequests" ]; then
    perl -p -i -e 's/net\.nanopay\.liquidity\.approvalRequest/foam\.nanos\.approval/g;' "$JOURNAL_HOME"/approvalRequests
fi

if [ -f "$JOURNAL_HOME/approvalRequests" ]; then
    perl -p -i -e 's/net\.nanopay\.approval/foam\.nanos\.approval/g;' "$JOURNAL_HOME"/approvalRequests
fi

