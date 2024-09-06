!/bin/bash
# Curl test scripts

# HTTP Version
# http1
curl -k -v --http1 https://localhost:8443/index.html

# http2
curl -k -v --http2-prior-knowledge https://localhost:8443/index.html

# GZIP Compression
# output of this should be larger than following
curl -k -v --silent --write-out "%{size_download}\n" --output /dev/null -H "Accept-Encoding: gzip,deflate" https://localhost:8300/foam-bin-4.35.js

# no compression
curl -k -v --silent --write-out "%{size_download}\n" --output /dev/null https://localhost:8300/foam-bin-4.35.js
