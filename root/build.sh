#Shutdown tomcat if already running
/$CATALINA_HOME/bin/shutdown.sh

#Remove build folder and rebuild foam
rm -rf ../../foam2/build/
cd ../../foam2/src/
./gen.sh
cd ../build/
mvn clean install

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

#Start the server
cd $CATALINA_HOME/bin/
./startup.sh