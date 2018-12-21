#!/bin/sh

# Exit on first failure
set -e

# copy foam-bin into libs
cd ../foam2/tools
node build.js web,nanos
cp ../foam-bin.js ../../merchant/src/net/nanopay/merchant/libs/foam/

# copy nanopay-bin into libs
cd ../../nanopay/src/
./gen.sh
cp ../../nanopay-bin.js ../../merchant/src/net/nanopay/merchant/libs/nanopay/

cd ../../merchant/
./node_modules/babel/bin/babel.js -b useStrict src/net/nanopay/merchant/libs/foam/foam-bin.js -o src/net/nanopay/merchant/libs/foam/foam-bin.js
./node_modules/babel/bin/babel.js -b useStrict src/net/nanopay/merchant/libs/nanopay/nanopay-bin.js -o src/net/nanopay/merchant/libs/nanopay/nanopay-bin.js