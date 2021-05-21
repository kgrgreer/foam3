#!/bin/bash

VERSION=$(gradle -q getVersion)
TARBALL=/tmp/noc/${TARBALL_NAME}.tar.gz
TARBALL_NAME=nanopay-deploy-${VERSION}.tar.gz
TMP_PATH=/tmp/deploy
rm -rf ${TMP_PATH}
mkdir -p ${TMP_PATH}
cp target/package/${TARBALL_NAME} ${TMP_PATH}/
TARBALL=${TMP_PATH}/${TARBALL_NAME}

exec 4<$1
while read -u4 m; do
    echo $m
    tools/deployment/install_remote.sh -W$m -T${TARBALL} &
done
