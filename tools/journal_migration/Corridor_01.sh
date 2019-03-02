#!/bin/bash

# Migrate Corridor

if [ -f "$JOURNAL_HOME/corridors" ]; then
    perl -p -i -e 's/interac\.model\.Corridor/Corridor/g;' "$JOURNAL_HOME"/corridors
fi
