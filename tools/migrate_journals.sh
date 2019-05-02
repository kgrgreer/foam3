#!/bin/bash
# Run all the migration scripts in migrate.
# Scripts are only applied once, then moved to the migrated folder.
#
# files in MIGRATE are applied in sorted order.
# with Users_01.sh before Users_02.sh
# for file in * will list in alphabetical sorted order.
#
printf "migrating $0 $1\n"
JOURNAL_HOME=$1
if [ -z "$JOURNAL_HOME" ]; then
    JOURNAL_HOME="/opt/nanopay/journals"
fi
export JOURNAL_HOME

MIGRATE="tools/journal_migration"
MIGRATED="$JOURNAL_HOME/migrated"

mkdir -p "$MIGRATED"

cd "$MIGRATE"
for file in *
do
    if [ ! -f "$MIGRATED/$file" ]; then
        printf "running migration $file\n"
        ./"$file"
        cp "$file" "$MIGRATED/$file"
    fi
done
