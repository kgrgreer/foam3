#!/bin/bash

exec 4<$1
while read -u4 m; do
    echo $m
    ssh $m 'sudo rm -rf /mnt/nanopay/backups; sudo mkdir /mnt/nanopay/backups; sudo chown nanopay /mnt/nanopay/backups'
done
