#!/bin/bash
node foam3/tools/build.js -uck -Ppom,foam3/src/foam/nanos/medusa/pom -J../foam3/deployment/m,../foam3/deployment/mn,mn,../foam3/deployment/cluster_1 "$@"
