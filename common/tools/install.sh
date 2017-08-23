#!/bin/sh
mvn install:install-file -Dfile="../build/target/nanopay-common-0.0.2.jar" -DgroupId=net.nanopay -DartifactId=nanopay-common -Dversion=0.0.2 -Dpackaging=jar

