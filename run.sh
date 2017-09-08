#!/bin/sh

# Exit on first failure
set -e

cd ..
find foam2/src NANOPAY/**/src -type f -name accounts -exec cat {} \; -exec echo \; > accounts
find foam2/src NANOPAY/**/src -type f -name banks -exec cat {} \; -exec echo \; > banks
find foam2/src NANOPAY/**/src -type f -name bankAccounts -exec cat {} \; -exec echo \; > bankAccounts
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; -exec echo \; > services
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; -exec echo \; > transactions
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; -exec echo \; > users
find foam2/src NANOPAY/**/src -type f -name payees -exec cat {} \; -exec echo \; > payees

cd foam2/src
./gen.sh

cd ../build
mvn compile package
mvn install:install-file -Dfile="target/foam-1.0-SNAPSHOT.jar" -DgroupId=com.google -DartifactId=foam -Dversion=1.0 -Dname=foam -Dpackaging=jar
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

cd ../../NANOPAY
./gen.sh

# NANOPAY doesn't all build successfully at the moment
set +e
mvn clean install
set -e

cd ..
./NANOPAY/tools/nanos.sh
