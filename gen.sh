#!/bin/sh

cd admin-portal/src && ./gen.sh && cd ../..
cd b2b/src && ./gen.sh && cd ../..
cd nanopay/src && ./gen.sh && cd ../..
cd merchant/src && ./gen.sh && cd ../..
cd retail/src && ./gen.sh && cd ../..
cd interac/src && ./gen.sh && cd ../..