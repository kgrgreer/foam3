#!/bin/sh
# run from parent directory of foam2

# exit on first failure
set -e

find foam2/src NANOPAY/**/src -type f -name accounts -exec cat {} \; -exec echo \; > accounts
find foam2/src NANOPAY/**/src -type f -name banks -exec cat {} \; -exec echo \; > banks
find foam2/src NANOPAY/**/src -type f -name bankAccounts -exec cat {} \; -exec echo \; > bankAccounts
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; -exec echo \; > services
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; -exec echo \; > transactions
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; -exec echo \; > users
find foam2/src NANOPAY/**/src -type f -name payees -exec cat {} \; -exec echo \; > payees

cd NANOPAY/
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

cd ../
java -cp `cat foam2/build/cp.txt`:`cat NANOPAY/**/cp.txt`:`realpath NANOPAY/**/target/*.jar | paste -sd ":" -` foam.nanos.boot.Boot
