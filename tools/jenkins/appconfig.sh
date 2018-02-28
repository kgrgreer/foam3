#!/bin/bash
# Set AppConfig values

RELEASE=`echo ${GIT_BRANCH} | sed 's/.*\///'`
NAME=`echo ${RELEASE} | sed 's/-v.*//'`
VERSION=`echo ${RELEASE} | sed 's/.*-v//'`
MODE="DEVELOPMENT"
YEAR=`date +%Y`
COPYRIGHT="(c) Copyright ${YEAR} nanopay Corporation. All Rights Reserved"

echo
if [[ "${NAME}" = *"test"* ]]; then
    MODE=4 #"TEST"
elif [[ "${NAME}" = *"prod"* ]]; then
    MODE=2 #"PRODUCTION"
elif [[ "${NAME}" = *"integration"* ]]; then
    MODE=3 #"DEMO"
elif [[ "${NAME}" = *"demo"* ]]; then
    MODE=3 #"DEMO"
elif [[ "${NAME}" = *"staging"* ]]; then
    MODE=1 #"STAGING"
fi

echo RELEASE=${RELEASE}
echo NAME=${NAME}
echo VERSION=${VERSION}
echo MODE=${MODE}

sed -i -e "s/name: 'name'/name: 'name', value: '${NAME}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'version'/name: 'version', value: '${VERSION}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'copyright'/name: 'copyright', value: '${COPYRIGHT}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'mode'/name: 'mode', value: ${MODE}/g" foam2/src/foam/nanos/app/AppConfig.js

exit 0
