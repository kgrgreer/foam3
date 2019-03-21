#!/bin/bash

# migrate Liquidity CronJobs, LiquiditySettingsCheckCron from .tx.cron to .liquidity and Frequency from tx.model to liquidity.

if [ -f "$JOURNAL_HOME/cronjobs" ]; then
    perl -p -i -e 's/net\.nanopay\.tx\.cron\.LiquiditySettingsCheckCron/net\.nanopay\.liquidity\.LiquiditySettingsCheckCron/g;' "$JOURNAL_HOME"/cronjobs
fi

if [ -f "$JOURNAL_HOME/cronjobs" ]; then
    perl -p -i -e 's/net\.nanopay\.tx\.model\.Frequency/net\.nanopay\.liquidity\.Frequency/g;' "$JOURNAL_HOME"/cronjobs
fi

if [ -f "$JOURNAL_HOME/cronjobs.0" ]; then
    perl -p -i -e 's/net\.nanopay\.tx\.cron\.LiquiditySettingsCheckCron/net\.nanopay\.liquidity\.LiquiditySettingsCheckCron/g;' "$JOURNAL_HOME"/cronjobs.0
fi

if [ -f "$JOURNAL_HOME/cronjobs.0" ]; then
    perl -p -i -e 's/net\.nanopay\.tx\.model\.Frequency/net\.nanopay\.liquidity\.Frequency/g;' "$JOURNAL_HOME"/cronjobs.0
fi
