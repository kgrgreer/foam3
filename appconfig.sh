# Set AppConfig.version
VERSION=`echo ${GIT_BRANCH} | sed 's/.*\///'`
echo VERSION=${VERSION}
sed -i -e "s/name: 'version'/name: 'version', value: '${VERSION}'/g" foam2/src/foam/nanos/app/AppConfig.js

# Set AppConfig.url
HTTP="https"
DOMAIN=".nanopay.net"
SUB=`echo ${VERSION} | sed 's/.*\///' | sed 's/-v.*//'`
echo
if [[ "${SUB}" = *"b2b-prod"* ]]; then
    SUB = "portal"
elif [[ "${SUB}" = *"cc-demo"* ]]; then
    SUB = "sandbox"
elif [[ "${SUB}" = *"cc-integration"* ]]; then
    SUB = "sandbox"
elif [[ "${SUB}" = *"prod"* ]]; then
    SUB=`echo $SUB | sed 's/\.prod//g'`
elif [[ "${SUB}" = *"integration"* ]]; then
    SUB=`echo ${SUB} | sed 's/\./-/g'`
    # replace integration with staging?
    #SUB=`echo ${SUB} | sed 's/staging/integration/g'`
elif [[ "${SUB}" = *"staging"* ]]; then
    HTTP="http"
    SUB=`echo ${SUB} | sed 's/-/./g'`
elif [[ $SUB = *"demo"* ]]; then
    SUB=`echo ${SUB} | sed 's/\./-/g'`
else
    HTTP="http"
    SUB="localhost:8080"
    DOMAIN=""
fi
URL="${HTTP}://${SUB}${DOMAIN}"
echo URL=${URL}
sed -i -e "s,http://localhost:8080,${URL}," foam2/src/foam/nanos/app/AppConfig.js

exit 0
