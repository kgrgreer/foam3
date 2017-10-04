#!/bin/sh

# Exit on first failure
set -e

# copy foam-bin into libs
cd ../../foam2/src
./gen.sh
cp ../foam-bin.js ../../NANOPAY/merchant/src/net/nanopay/merchant/libs/foam/

# copy nanopay-bin into libs
cd ../../NANOPAY/nanopay/src/
./gen.sh
cp ../../nanopay-bin.js ../../merchant/src/net/nanopay/merchant/libs/nanopay/
