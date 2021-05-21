#!/bin/bash
d=$(date +%Y%m%d%H%M%S)
echo $d

exec 4<$1
while read -u4 m; do
    echo $m
    ssh -o ConnectTimeout=5 $m "sudo systemctl stop nanopay; sudo cp /opt/nanopay/journals/ledger ledger-${d}; sudo systemctl start nanopay"
done
