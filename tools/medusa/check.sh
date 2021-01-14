#!/bin/bash

exec 4<$1
while read -u4 m; do
    echo $m
    wget $m:8080/service/health
done
