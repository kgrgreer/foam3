#!/bin/bash
if [ "$#" -ne 2 ]; then
    echo "usage: $0 date node-list  (with date in format YYYYMMDDHHMMSS)"
    exit 1
fi

d=$1
exec 4<$2
while read -u4 m; do
    echo $m
    ssh -o ConnectTimeout=5 $m "sudo systemctl stop nanopay; sudo cp ledger-${d} /opt/nanopay/journals/ledger; sudo systemctl start nanopay"
done
