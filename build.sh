cd /pkg/stack/stage/NANOPAY
npm install

set -e
cwd=$(pwd)

# build
./gen.sh
mvn clean install

# FIXME: can't have this kind of stop/start cycle for production

# shutdown
cp target/ROOT.war /opt/tomcat/webapps
cd /opt/tomcat/bin
./shutdown.sh
# REVIEW: wait for shutdown

# backup journals in event of file incompatiblity between versions
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /opt/backup/$DATE
cp -r /opt/tomcat/bin/* /opt/backup/$DATE/

./startup.sh
sleep 5

cd /pkg/stack/stage/NANOPAY
./find.sh

cp brokers /opt/tomcat/bin/
cp businessSectors /opt/tomcat/bin/
cp businessTypes /opt/tomcat/bin/
cp cicoServiceProviders /opt/tomcat/bin/
cp corridors /opt/tomcat/bin/
cp countries /opt/tomcat/bin/
cp cronjobs /opt/tomcat/bin/
cp currencies /opt/tomcat/bin/
cp emailTemplates /opt/tomcat/bin/
cp exportDriverRegistrys /opt/tomcat/bin/
cp -n groups /opt/tomcat/bin/
cp institutions /opt/tomcat/bin/
cp languages /opt/tomcat/bin/
cp menus /opt/tomcat/bin/
cp payoutOptions /opt/tomcat/bin/
cp -n permissions /opt/tomcat/bin/
cp regions /opt/tomcat/bin/
cp -n scripts /opt/tomcat/bin/
cp services /opt/tomcat/bin/
cp -n spids /opt/tomcat/bin/
cp tests /opt/tomcat/bin/
cp transactionLimits /opt/tomcat/bin/
cp transactionPurposes /opt/tomcat/bin/
cp -n users /opt/tomcat/bin/

# Copy over static web files to ROOT
cp -r foam2/ /opt/tomcat/webapps/ROOT/foam2
cp -r nanopay/ /opt/tomcat/webapps/ROOT/nanopay
cp -r merchant/ /opt/tomcat/webapps/ROOT/merchant
cp -r favicon/ /opt/tomcat/webapps/ROOT/favicon

# Move images to ROOT/images
cd /opt/tomcat/webapps/ROOT
mkdir images
cp -r nanopay/src/net/nanopay/images .
cp -r merchant/src/net/nanopay/merchant/images .

# delete com
rm -rf foam2/src/com
