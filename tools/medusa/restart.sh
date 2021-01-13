#!/bin/bash

exec 4<$1
while read -u4 m; do
    echo $m
    ssh $m 'sudo systemctl restart nanopay'
done
