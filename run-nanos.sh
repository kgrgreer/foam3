#!/bin/sh

# Exit on first failure
set -e

./gen.sh
# NANOPAY doesn't all build successfully at the moment
set +e
mvn clean install
set -e

cd .. && ./NANOPAY/tools/nanos.sh
