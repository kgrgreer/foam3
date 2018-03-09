#!/bin/bash
# Set AppConfig values

RELEASE=`echo ${GIT_BRANCH} | sed 's/.*\///'`
NAME=`echo ${RELEASE} | sed 's/-v.*//'`
VERSION=`echo ${RELEASE} | sed 's/.*-v//'`
MODE="'DEVELOPMENT'"
YEAR=`date +%Y`
COPYRIGHT="(c) Copyright ${YEAR} nanopay Corporation. All Rights Reserved"
INSTANCE="PORTAL"

echo
if [[ "${NAME}" = *"test"* ]]; then
    MODE="'TEST'" #"TEST"
elif [[ "${NAME}" = *"prod"* ]]; then
    MODE="'PRODUCTION'" #"PRODUCTION"
elif [[ "${NAME}" = *"integration"* ]]; then
    MODE="'DEMO'" #"DEMO"
elif [[ "${NAME}" = *"demo"* ]]; then
    MODE="'DEMO'" #"DEMO"
elif [[ "${NAME}" = *"staging"* ]]; then
    MODE="'STAGING'" #"STAGING"
fi

echo RELEASE=${RELEASE}
echo NAME=${NAME}
echo VERSION=${VERSION}
echo MODE=${MODE}
echo INSTANCE=${INSTANCE}


sed -i -e "s/name: 'name'/name: 'name', value: '${NAME}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'version'/name: 'version', value: '${VERSION}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'copyright'/name: 'copyright', value: '${COPYRIGHT}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e " s/.*MODE.*/MODE=${MODE}/g" find.sh

sed -i -e " s/.*INSTANCE.*/INSTANCE=${INSTANCE}/g" find.sh

sed -i -e " s/.*VERSION.*/VERSION=${VERSION}/g" find.sh
exit 0
