#!/bin/bash

# correct image paths for new build

export JOURNAL_HOME=/opt/nanopay/journals
if [ -f "$JOURNAL_HOME/services" ]; then
    perl -p -i -e 's/pathSpec\":\"\/images\/\*\",initParameters:\{\"paths\":\".*\"\}\},/pathSpec\":\"\/images\/\*\",initParameters:\{\"paths\":\"images\"\}\},/g;' "$JOURNAL_HOME"/services
fi

if [ -f "$JOURNAL_HOME/services.0" ]; then
    perl -p -i -e 's/pathSpec\":\"\/images\/\*\",initParameters:\{\"paths\":\".*\"\}\},/pathSpec\":\"\/images\/\*\",initParameters:\{\"paths\":\"images\"\}\},/g;' "$JOURNAL_HOME"/services.0
fi
