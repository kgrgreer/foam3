#!/bin/bash

exec 4<$1
while read -u4 m; do
    echo $m
    wget --tries=1 --timeout=5 --output-document=/dev/null $m:8080/service/health
done
