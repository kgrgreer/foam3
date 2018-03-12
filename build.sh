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

# Copy repository journal, creating the .0 file which will be read before the app managed journal.
# journals created by find.sh
filename="journals"
if [[ ! -f "$filename" ]]; then
  echo "ERROR: missing $filename file."
  exit 1
fi

while read journal; do
    cp "$journal" "/opt/tomcat/bin/$journal.0"
done < "$filename"

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
