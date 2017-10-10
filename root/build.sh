# exit on first failure
set -e

#Shutdown tomcat if already running
/$CATALINA_HOME/bin/shutdown.sh

#Remove build folder and rebuild foam
rm -rf ../../foam2/build/
cd ../../foam2/src/
./gen.sh
cd ../build/
mvn compile package
mvn install:install-file -Dfile="target/foam-1.0-SNAPSHOT.jar" -DgroupId=com.google -DartifactId=foam -Dversion=1.0 -Dname=foam -Dpackaging=jar
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

#Remove build folder and rebuild nanopay
cd ../../NANOPAY/nanopay/
rm -rf build/
cd src/
./gen.sh
cd ..
mvn clean install

#Build root which is 1 war file of all projects
cd ../root/
mvn clean install

#Copy over files to tomcat location
cp target/ROOT.war $CATALINA_HOME/webapps

#Concatenate files into one services file
cd ../../
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services

#Copy over services file to /bin
cp services $CATALINA_HOME/bin/

#Start the server
cd $CATALINA_HOME/bin/
./startup.sh