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

cp brokers /opt/tomcat/bin/
cp businessSectors /opt/tomcat/bin/
cp businessTypes /opt/tomcat/bin/
cp cicoServiceProviders /opt/tomcat/bin/
cp countries /opt/tomcat/bin/
cp cronjobs /opt/tomcat/bin/
cp currencies /opt/tomcat/bin/
cp corridors /opt/tomcat/bin/
cp purposesOfTransfer /opt/tomcat/bin/
cp emailTemplates /opt/tomcat/bin/
cp exportDriverRegistrys /opt/tomcat/bin/
cp groups /opt/tomcat/bin/
cp languages /opt/tomcat/bin/
cp menus /opt/tomcat/bin/
cp permissions /opt/tomcat/bin/
cp regions /opt/tomcat/bin/
cp scripts /opt/tomcat/bin/
cp services /opt/tomcat/bin/
cp tests /opt/tomcat/bin/
cp transactionLimits /opt/tomcat/bin/
cp -n users /opt/tomcat/bin/
cp institutions /opt/tomcat/bin/

# Copy over static web files to ROOT
cp -r foam2/ /opt/tomcat/webapps/ROOT/foam2
cp -r nanopay/ /opt/tomcat/webapps/ROOT/nanopay
cp -r merchant/ /opt/tomcat/webapps/ROOT/merchant
cp -r favicon/ /opt/tomcat/webapps/ROOT/favicon

# Move images to ROOT/images
cd /opt/tomcat/webapps/ROOT
mkdir images
cd nanopay/src/net/nanopay/
mv images/ ../../.././../

cd ../../../../foam2/src/
rm -rf com
