#!/bin/sh

# Exit on first failure
set -e

cd ..
find foam2/src NANOPAY/**/src -type f -name accounts -exec cat {} \; > accounts
find foam2/src NANOPAY/**/src -type f -name banks -exec cat {} \; > banks
find foam2/src NANOPAY/**/src -type f -name bankAccounts -exec cat {} \; > bankAccounts
find foam2/src NANOPAY/**/src -type f -name businesses -exec cat {} \; > businesses
find foam2/src NANOPAY/**/src -type f -name businessTypes -exec cat {} \; > businessTypes
find foam2/src NANOPAY/**/src -type f -name businessSectors -exec cat {} \; > businessSectors
find foam2/src NANOPAY/**/src -type f -name businesses -exec cat {} \; > businesses
find foam2/src NANOPAY/**/src -type f -name countries -exec cat {} \; > countries
find foam2/src NANOPAY/**/src -type f -name countryAgents -exec cat {} \; > countryAgents
find foam2/src NANOPAY/**/src -type f -name crons -exec cat {} \; > crons
find foam2/src NANOPAY/**/src -type f -name devices -exec cat {} \; > devices
find foam2/src NANOPAY/**/src -type f -name dateofbirth -exec cat {} \; > dateofbirth
find foam2/src NANOPAY/**/src -type f -name exchangeRates -exec cat {} \; > exchangeRates
find foam2/src NANOPAY/**/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find foam2/src NANOPAY/**/src -type f -name groups -exec cat {} \; > groups
find foam2/src NANOPAY/**/src -type f -name invoices -exec cat {} \; > invoices
find foam2/src NANOPAY/**/src -type f -name identification -exec cat {} \; > identification
find foam2/src NANOPAY/**/src -type f -name languages -exec cat {} \; > languages
find foam2/src NANOPAY/**/src -type f -name menus -exec cat {} \; > menus
find foam2/src NANOPAY/**/src -type f -name pacs8india -exec cat {} \; > pacs8india
find foam2/src NANOPAY/**/src -type f -name pacs8iso -exec cat {} \; > pacs8iso
find foam2/src NANOPAY/**/src -type f -name payees -exec cat {} \; > payees
find foam2/src NANOPAY/**/src -type f -name permissions -exec cat {} \; > permissions
find foam2/src NANOPAY/**/src -type f -name regions -exec cat {} \; > regions
find foam2/src NANOPAY/**/src -type f -name script -exec cat {} \; > script
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services
find foam2/src NANOPAY/**/src -type f -name tests -exec cat {} \; > tests
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; > transactions
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; > users

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
