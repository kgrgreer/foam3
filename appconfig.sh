#!/bin/bash
# Set AppConfig values

RELEASE=`echo ${GIT_BRANCH} | sed 's/.*\///'`
#echo RELEASE=${RELEASE}
HTTP="https"
DOMAIN=".nanopay.net"
NAME=`echo ${RELEASE} | sed 's/.*\///' | sed 's/-v.*//'`
VERSION=`echo ${RELEASE} | sed 's/.*\///' | sed 's/.*-v//'`
MODE="DEVELOPMENT"

echo
if [[ "${NAME}" = *"b2b-prod"* ]]; then
    NAME="portal"
    MODE="PRODUCTION"
elif [[ "${NAME}" = *"cc-demo"* ]]; then
    NAME="sandbox"
    MODE="DEMO"
elif [[ "${NAME}" = *"cc-integration"* ]]; then
    NAME="sandbox"
    MODE="DEMO"
elif [[ "${NAME}" = *"test"* ]]; then
    HTTP="http"
    NAME=`echo ${NAME} | sed 's/-/./g'`
    MODE="TEST"
elif [[ "${NAME}" = *"prod"* ]]; then
    NAME=`echo $NAME | sed 's/\.prod//g'`
    MODE="PRODUCTION"
elif [[ "${NAME}" = *"integration"* ]]; then
    NAME=`echo ${NAME} | sed 's/\./-/g'`
    MODE="DEMO"
elif [[ "${NAME}" = *"demo"* ]]; then
    NAME=`echo ${NAME} | sed 's/\./-/g'`
    MODE="DEMO"
elif [[ "${NAME}" = *"staging"* ]]; then
    HTTP="http"
    MODE="STAGING"
    NAME=`echo ${NAME} | sed 's/-/./g'`
else
    HTTP="http"
    NAME="localhost:8080"
    DOMAIN=""
fi

URL="${HTTP}://${NAME}${DOMAIN}"

echo RELEASE=${RELEASE}
echo NAME=${NAME}
echo VERSION=${VERSION}
echo URL=${URL}
echo MODE=${MODE}

sed -i -e "s/name: 'name'/name: 'name', value: '${NAME}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'version'/name: 'version', value: '${VERSION}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s,value: 'http.*','${URL}'," foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'mode'/name: 'mode', value: '${MODE}'/g" foam2/src/foam/nanos/app/AppConfig.js

exit 0
