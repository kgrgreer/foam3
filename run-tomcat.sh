#!/bin/sh
# Exit on first failure
set -e
cwd=$(pwd)

./gen.sh
mvn clean install

#Shutdown tomcat if already running
/$CATALINA_HOME/bin/shutdown.sh 2> /dev/null

# Copy over war and server config files.
# These are needed before server startup
cp target/ROOT.war $CATALINA_HOME/webapps

#Start the server
cd $CATALINA_HOME/bin/
./startup.sh
sleep 5

cd $cwd
./find.sh

#Copy over all JDAO files to /bin
cp brokers $CATALINA_HOME/bin/
cp businessSectors $CATALINA_HOME/bin/
cp businessTypes $CATALINA_HOME/bin/
cp cicoServiceProviders $CATALINA_HOME/bin/
cp countries $CATALINA_HOME/bin/
cp cronjobs $CATALINA_HOME/bin/
cp currency $CATALINA_HOME/bin/
cp emailTemplates $CATALINA_HOME/bin/
cp exportDriverRegistrys $CATALINA_HOME/bin/
cp groups $CATALINA_HOME/bin/
cp languages $CATALINA_HOME/bin/
cp menus $CATALINA_HOME/bin/
cp permissions $CATALINA_HOME/bin/
cp regions $CATALINA_HOME/bin/
cp scripts $CATALINA_HOME/bin/
cp services $CATALINA_HOME/bin/
cp tests $CATALINA_HOME/bin/
cp transactionLimits $CATALINA_HOME/bin/
cp users $CATALINA_HOME/bin/

# Copy over static web files to ROOT
cp -r foam2/ /Library/Tomcat/webapps/ROOT/foam2
cp -r nanopay/ /Library/Tomcat/webapps/ROOT/nanopay
cp -r merchant/ /Library/Tomcat/webapps/ROOT/merchant

# Move images to ROOT/images
cd /Library/Tomcat/webapps/ROOT
mkdir images
cd nanopay/src/net/nanopay/
mv images/ ../../.././../

cd ../../../../foam2/src/
rm -rf com
