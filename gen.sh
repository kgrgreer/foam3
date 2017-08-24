#!/bin/sh

cd admin-portal/src && ./gen.sh && cd ../..
cd b2b/src && ./gen.sh && cd ../..
cd common/src && ./gen.sh && cd ../..
cd ingenico/src && ./gen.sh && cd ../..
cd retail/src && ./gen.sh && cd ../..
cd interac/src && ./gen.sh && cd ../..