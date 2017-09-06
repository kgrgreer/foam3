#!/bin/sh
# run from parent directory of foam2

# exit on first failure
set -e

cd NANOPAY/
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

cd ../
java -cp `cat foam2/build/cp.txt`:`cat NANOPAY/**/cp.txt`:`realpath NANOPAY/**/target/*.jar | paste -sd ":" -` foam.nanos.boot.Boot
