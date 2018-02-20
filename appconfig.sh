# Set AppConfig.version
VERSION=`echo ${GIT_BRANCH} | sed 's/.*\///'`
echo VERSION=${VERSION}
sed -i -e "s/name: 'version'/name: 'version', value: '${VERSION}'/g" foam2/src/foam/nanos/app/AppConfig.js

# Set AppConfig.url
HTTP="https"
URL=`echo ${VERSION} | sed 's/.*\///' | sed 's/-v.*//' | sed 's/-/./g'`
URL="${URL}.nanopay.net"
if [[ $URL = *"b2b.prod"* ]]; then
        url = "portal.nanopay.net"
elif [[ $URL = *"interac-staging"* ]]; then
    url = "interac-staging.nanopay.net"
    HTTP = "https"
elif [[ $URL = *"staging"* ]]; then
        url = "localhost:8080"
    HTTP = "http"
fi

URL=${HTTP}://${URL}
echo URL=${URL}
sed -i -e "s,http://localhost:8080,${URL}," foam2/src/foam/nanos/app/AppConfig.js

exit 0
