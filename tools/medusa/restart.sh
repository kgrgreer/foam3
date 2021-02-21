#!/bin/bash

exec 4<$1
while read -u4 m; do
    echo $m
    ssh -o ConnectTimeout=5 $m 'sudo systemctl restart nanopay'
done
