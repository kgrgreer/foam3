#!/bin/sh


# Build root and compile
./gen.sh
mvn clean install
./find.sh

#Copy over all required files to $CATALINA_HOME/bin/
#cp server.xml $CATALINA_HOME/conf
# exit on first failure
set -e

#Shutdown tomcat if already running
/$CATALINA_HOME/bin/shutdown.sh 2> /dev/null

#Copy over files to tomcat location
cp target/ROOT.war $CATALINA_HOME/webapps
cp server.xml $CATALINA_HOME/conf

cd ../

#Copy over all JDAO files to /bin
cp accounts $CATALINA_HOME/bin/
cp branches $CATALINA_HOME/bin/
cp bankAccounts $CATALINA_HOME/bin/
cp brokers $CATALINA_HOME/bin/
cp businesses $CATALINA_HOME/bin/
cp canadaTransactions $CATALINA_HOME/bin/
cp cicoServiceProviders $CATALINA_HOME/bin/
cp countries $CATALINA_HOME/bin/
cp countryAgents $CATALINA_HOME/bin/
cp cronjobs $CATALINA_HOME/bin/
cp currency $CATALINA_HOME/bin/
cp devices $CATALINA_HOME/bin/
cp dateofbirth $CATALINA_HOME/bin/
cp exchangeRates $CATALINA_HOME/bin/
cp exportDriverRegistrys $CATALINA_HOME/bin/
cp groups $CATALINA_HOME/bin/
cp historyRecords $CATALINA_HOME/bin/
cp indiaTransactions $CATALINA_HOME/bin/
cp identification $CATALINA_HOME/bin/
cp invoices $CATALINA_HOME/bin/
cp invoiceResolutions $CATALINA_HOME/bin/
cp languages $CATALINA_HOME/bin/
cp menus $CATALINA_HOME/bin/
cp pacs8india $CATALINA_HOME/bin/
cp pacs8iso $CATALINA_HOME/bin/
cp payees $CATALINA_HOME/bin/
cp permissions $CATALINA_HOME/bin/
cp regions $CATALINA_HOME/bin/
cp scripts $CATALINA_HOME/bin/
cp services $CATALINA_HOME/bin/
cp tests $CATALINA_HOME/bin/
cp transactions $CATALINA_HOME/bin/
cp users $CATALINA_HOME/bin/

#Copy over NANOPAY and foam2
rm -rf $CATALINA_HOME/bin/foam2/
cp -r foam2/ $CATALINA_HOME/bin/foam2

rm -rf $CATALINA_HOME/bin/NANOPAY/
cp -r NANOPAY/ $CATALINA_HOME/bin/NANOPAY

#Start the server
cd $CATALINA_HOME/bin/
./startup.sh
