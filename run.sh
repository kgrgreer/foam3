#!/bin/sh
cd ..
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services
cd foam2/src
./gen.sh
cd ../build
mvn compile package
mvn install:install-file -Dfile="target/foam-1.0-SNAPSHOT.jar" -DgroupId=com.google -DartifactId=foam -Dversion=1.0 -Dname=foam -Dpackaging=jar
cd ../../NANOPAY
./gen.sh
mvn clean install
cd ..
./NANOPAY/tools/nanos.sh
