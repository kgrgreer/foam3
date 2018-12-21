#!/bin/sh

# -z to daemonize
# -c to ensure clean build, shouldn't be necessary but nice to make sure
/pkg/stack/stage/NANOPAY/build.sh -z -c
