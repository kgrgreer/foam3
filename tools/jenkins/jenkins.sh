#!/bin/bash

CUSTOMER=
while getops "c:" opt; do
    case $opt in
        c)
            CUSTOMER=$OPTARG
            echo CUSTOMER=$CUSTOMER
            ;;
    esac
done

# Set AppConfig values

RELEASE=`echo ${GIT_BRANCH} | sed 's/.*\///'`
HTTP="https"
DOMAIN=".nanopay.net"
NAME=`echo ${RELEASE} | sed 's/.*\///' | sed 's/-v.*//'`
VERSION=`echo ${RELEASE} | sed 's/.*\///' | sed 's/.*-v//'`
MODE="DEVELOPMENT"
YEAR=`date +%Y`
COPYRIGHT="(c) Copyright ${YEAR} nanopay Corporation. All Rights Reserved"

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

sed -i -e "s/name: 'copyright'/name: 'copyright', value: '${COPYRIGHT}'/g" foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s,value: 'http:\/\/localhost:8080/', url: '${URL}/'," foam2/src/foam/nanos/app/AppConfig.js

sed -i -e "s/name: 'mode'/name: 'mode', value: '${MODE}'/g" foam2/src/foam/nanos/app/AppConfig.js

if [[ $CUSTOMER="CC" ]]; then
# Build specifics for Connected-City

sed -i -e "s,<welcome-file>/nanopay/src/net/nanopay/index.html</welcome-file>,<welcome-file>/nanopay/src/net/nanopay/connected-city.html</welcome-file>,g" WEB-INF/web.xml

sed -i -e "s,<param-value>/merchant/src/net/nanopay/merchant/index.html</param-value>,<param-value>/merchant/src/net/nanopay/merchant/connected-city.html</param-value>,g" WEB-INF/web.xml

sed -i -e "s/\"from\":\"info@nanopay.net\",\"replyTo\":\"noreply@nanopay.net\",\"displayName\":\"nanopay Corporation\"/\"from\":\"info@connectedcity.net\",\"replyTo\":\"noreply@connectedcity.net\",\"displayName\":\"ConnectedCity\"/g" nanopay/src/services

fi

exit 0
