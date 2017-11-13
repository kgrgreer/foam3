#!/bin/sh

# Exit on first failure
set -e
./find.sh
./gen.sh
mvn clean install
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;
java -cp `cat cp.txt`:`realpath target/*.jar | paste -sd ":" -` foam.nanos.boot.Boot
