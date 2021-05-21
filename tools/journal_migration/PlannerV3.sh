
#!/bin/bash

# remove "isQuoted":true, and "isQuoted":false, from transaction journals

if [ -f "$JOURNAL_HOME/transactions" ]; then
    perl -p -i -e 's/\"isQuoted\":true,//g;' "$JOURNAL_HOME"/transactions
    perl -p -i -e 's/\"isQuoted\":false,//g;' "$JOURNAL_HOME"/transactions
fi
