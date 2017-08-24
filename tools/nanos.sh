#!/bin/sh
# run from parent directory of foam2
cd NANOPAY/
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;
cd ../
java -cp `cat foam2/build/cp.txt`:`cat NANOPAY/**/cp.txt`:NANOPAY/b2b/target/b2b-0.0.1.jar foam.nanos.boot.Boot