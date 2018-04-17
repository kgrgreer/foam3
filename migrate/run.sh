#!/usr/bin/env bash

mvn clean install
mvn dependency:build-classpath -Dmdep.outputFile=classpath.txt;
echo > devices
echo > invoices
echo > transactions
echo > users
java -cp `cat classpath.txt`:`realpath target/*.jar | paste -sd ":" -` net.nanopay.migrate.Main