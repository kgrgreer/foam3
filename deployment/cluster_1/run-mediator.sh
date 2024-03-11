#!/bin/bash
node foam3/tools/build.js -Ppom,foam3/src/foam/nanos/medusa/pom -J../foam3/deployment/m,../foam3/deployment/mm,mm,../foam3/deployment/cluster_1 -Nargus -ud "$@"
