#!/bin/bash
# Set AppConfig values

RELEASE=`echo ${GIT_BRANCH} | sed 's/.*\///'`
VERSION=`echo ${RELEASE} | sed 's/.*\///' | sed 's/.*-v//'`
MODE="DEVELOPMENT"
YEAR=`date +%Y`
COPYRIGHT="(c) Copyright ${YEAR} nanopay Corporation. All Rights Reserved"

echo
if [[ "${NAME}" = *"test"* ]]; then
    MODE="TEST"
elif [[ "${NAME}" = *"prod"* ]]; then
    MODE="PRODUCTION"
elif [[ "${NAME}" = *"integration"* ]]; then
    MODE="DEMO"
elif [[ "${NAME}" = *"demo"* ]]; then
    MODE="DEMO"
elif [[ "${NAME}" = *"staging"* ]]; then
    MODE="STAGING"
fi

echo RELEASE=${RELEASE}
echo NAME=${NAME}
echo VERSION=${VERSION}
echo URL=${URL}
echo MODE=${MODE}

sed -i -e "s/name: 'name'/name: 'name', value: '${NAME}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'version'/name: 'version', value: '${VERSION}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'copyright'/name: 'copyright', value: '${COPYRIGHT}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'mode'/name: 'mode', value: '${MODE}'/g" foam2/src/foam/nanos/app/AppConfig.js

exit 0
