cd src
./gen.sh
cd ../build
mvn clean compile package
mvn install:install-file -Dfile="target/transaction-service-1.0-PROJECT.jar" -DgroupId=net.nanopay -DartifcatId=transaction-service -Dversion=1.0 -Dname=transaction-service -Dpackaging=jar

