#!/bin/bash

# Version all js files

RELEASE=`echo ${GIT_BRANCH} | sed 's/.*\///'`
VERSION=`echo ${RELEASE} | sed 's/.*\///' | sed 's/.*-v//'`

# rename references
sed -i -e "s/foam.js/foam-v${VERSION}.js/g" nanopay/src/net/nanopay/index.html
sed -i -e "s/foam.js/foam-v${VERSION}.js/g" nanopay/src/net/nanopay/connected-city.html
sed -i -e "s/nanos.js/nanos-v${VERSION}.js/g" nanopay/src/net/nanopay/index.html
sed -i -e "s/nanos.js/nanos-v${VERSION}.js/g" nanopay/src/net/nanopay/connected-city.html
sed -i -e "s/files.js/files-v${VERSION}.js/g" nanopay/src/net/nanopay/index.html
sed -i -e "s/files.js/files-v${VERSION}.js/g" nanopay/src/net/nanopay/connected-city.html

# rename files.
mv foam2/src/foam.js foam2/src/foam-v${VERSION}.js
mv foam2/src/foam/nanos/nanos.js foam2/src/foam/nanos/nanos-v${VERSION}.js
mv nanopay/src/net/nanopay/files.js nanopay/src/net/nanopay/files-v${VERSION}.js
mv nanopay/src/net/nanopay/flinks/utils/files.js nanopay/src/net/nanopay/flinks/utils/files-v${VERSION}.js
