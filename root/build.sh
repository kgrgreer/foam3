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
cd ../../NANOPAY/
./gen.sh
mvn clean install

cd nanopay/
rm -rf build/
cd src/
./gen.sh
cd ..
mvn clean install

#Build root which is 1 war file of all projects
cd ../root/
mvn clean install

#Copy over files to tomcat location
cp target/nanofoam-0.0.1.war $CATALINA_HOME/webapps
cp server.xml $CATALINA_HOME/conf

#Concatenate files into one services file
cd ../../
find foam2/src NANOPAY/**/src -type f -name accounts -exec cat {} \; > accounts
find foam2/src NANOPAY/**/src -type f -name branches -exec cat {} \; > branches
find foam2/src NANOPAY/**/src -type f -name bankAccounts -exec cat {} \; > bankAccounts
find foam2/src NANOPAY/**/src -type f -name branches -exec cat {} \; > branches
find foam2/src NANOPAY/**/src -type f -name brokers -exec cat {} \; > brokers
find foam2/src NANOPAY/**/src -type f -name businesses -exec cat {} \; > businesses
find foam2/src NANOPAY/**/src -type f -name canadaTransactions -exec cat {} \; > canadaTransactions
find foam2/src NANOPAY/**/src -type f -name cicoServiceProviders -exec cat {} \; > cicoServiceProviders
find foam2/src NANOPAY/**/src -type f -name countries -exec cat {} \; > countries
find foam2/src NANOPAY/**/src -type f -name countryAgents -exec cat {} \; > countryAgents
find foam2/src NANOPAY/**/src -type f -name cronjobs -exec cat {} \; > cronjobs
find foam2/src NANOPAY/**/src -type f -name currency -exec cat {} \; > currency
find foam2/src NANOPAY/**/src -type f -name devices -exec cat {} \; > devices
find foam2/src NANOPAY/**/src -type f -name dateofbirth -exec cat {} \; > dateofbirth
find foam2/src NANOPAY/**/src -type f -name exchangeRates -exec cat {} \; > exchangeRates
find foam2/src NANOPAY/**/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find foam2/src NANOPAY/**/src -type f -name groups -exec cat {} \; > groups
find foam2/src NANOPAY/**/src -type f -name historyRecords -exec cat {} \; > historyRecords
find foam2/src NANOPAY/**/src -type f -name indiaTransactions -exec cat {} \; > indiaTransactions
find foam2/src NANOPAY/**/src -type f -name identification -exec cat {} \; > identification
find foam2/src NANOPAY/**/src -type f -name invoices -exec cat {} \; > invoices
find foam2/src NANOPAY/**/src -type f -name invoiceResolutions -exec cat {} \; > invoiceResolutions
find foam2/src NANOPAY/**/src -type f -name languages -exec cat {} \; > languages
find foam2/src NANOPAY/**/src -type f -name menus -exec cat {} \; > menus
find foam2/src NANOPAY/**/src -type f -name pacs8india -exec cat {} \; > pacs8india
find foam2/src NANOPAY/**/src -type f -name pacs8iso -exec cat {} \; > pacs8iso
find foam2/src NANOPAY/**/src -type f -name payees -exec cat {} \; > payees
find foam2/src NANOPAY/**/src -type f -name permissions -exec cat {} \; > permissions
find foam2/src NANOPAY/**/src -type f -name regions -exec cat {} \; > regions
find foam2/src NANOPAY/**/src -type f -name scripts -exec cat {} \; > scripts
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services
find foam2/src NANOPAY/**/src -type f -name tests -exec cat {} \; > tests
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; > transactions
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; > users

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