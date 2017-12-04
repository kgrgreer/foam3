cd /pkg/stack/stage/NANOPAY

set -e
cwd=$(pwd)

./gen.sh
mvn clean install

cp target/ROOT.war /opt/tomcat/webapps
cd /opt/tomcat/bin
./shutdown.sh
./startup.sh
sleep 5

cd /pkg/stack/stage/NANOPAY
./find.sh

cp brokers /opt/nanopay/
cp businessSectors /opt/nanopay/
cp businessTypes /opt/nanopay/
cp cicoServiceProviders /opt/nanopay/
cp countries /opt/nanopay/
cp cronjobs /opt/nanopay/
cp currency /opt/nanopay/
cp emailTemplates /opt/nanopay/
cp exportDriverRegistrys /opt/nanopay/
cp groups /opt/nanopay/
cp languages /opt/nanopay/
cp menus /opt/nanopay/
cp permissions /opt/nanopay/
cp regions /opt/nanopay/
cp scripts /opt/nanopay/
cp services /opt/nanopay/
cp tests /opt/nanopay/
cp transactionLimits /opt/nanopay/
cp users /opt/nanopay/

# Copy over static web files to ROOT
cp -r foam2/ /opt/tomcat/webapps/ROOT/foam2
cp -r nanopay/ /opt/tomcat/webapps/ROOT/nanopay
cp -r merchant/ /opt/tomcat/webapps/ROOT/merchant

# Move images to ROOT/images
cd /opt/tomcat/webapps/ROOT
mkdir images
cd nanopay/src/net/nanopay/
mv images/ ../../.././../

cd ../../../../foam2/src/
rm -rf com
