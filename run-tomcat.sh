#!/bin/sh
# Exit on first failure
set -e

NANOPAY_HOME=$(dirname $0)

function testcatalina {
    if [ -x "$1/bin/catalina.sh" ]; then
        echo "found. (" $1 ")"
        export CATALINA_HOME="$1"
    fi
}

while [ -z "$CATALINA_HOME" ]; do
    echo -n "Searching for catalina... "
    testcatalina /Library/Tomcat
    if [ ! -z "$CATALINA_HOME" ]; then
        break
    fi
    testcatalina $HOME/tools/tomcat
    if [ ! -z "$CATALINA_HOME" ]; then
        break
    fi
    echo "not found."
    echo "Set CATALINA_HOME environment variable to the location of Tomcat."
    exit 1
done

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -f : Run in foreground."
    echo "  -h : Print usage information."
}

DEBUG=0
FOREGROUND=0
while getopts "dfh" opt ; do
    case $opt in
        d) DEBUG=1 ;;
        f) FOREGROUND=1 ;;
        h) usage ; exit 0 ;;
        ?) usage ; exit 1 ;;
    esac
done

#Shutdown tomcat if already running
$CATALINA_HOME/bin/shutdown.sh &> /dev/null

function rmdir {
    if test -d $1 ; then
        rm -r $1
    fi
}

function rmfile {
    if test -f $1 ; then
        rm $1
    fi
}

WEBAPPS=$CATALINA_HOME/webapps

cd $NANOPAY_HOME

./gen.sh
mvn clean install

# Copy over war and server config files.
# These are needed before server startup
rmfile $WEBAPPS/ROOT.war
rmdir $WEBAPPS/ROOT

unzip $NANOPAY_HOME/target/ROOT.war -d $WEBAPPS/ROOT

cd $NANOPAY_HOME
./find.sh

#Copy over all JDAO files to /bin
cp brokers $CATALINA_HOME/bin/
cp businessSectors $CATALINA_HOME/bin/
cp businessTypes $CATALINA_HOME/bin/
cp cicoServiceProviders $CATALINA_HOME/bin/
cp countries $CATALINA_HOME/bin/
cp cronjobs $CATALINA_HOME/bin/
cp currency $CATALINA_HOME/bin/
cp dugs $CATALINA_HOME/bin/
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
cp institutions $CATALINA_HOME/bin/
cp serviceProviders $CATALINA_HOME/bin/

# Some older scripts may have copied foam2/nanopay/merchant as their own webapps.
rmdir $WEBAPPS/foam2
rmdir $WEBAPPS/nanopay
rmdir $WEBAPPS/merchant

# Copy over static web files to ROOT
cp -r foam2 $WEBAPPS/ROOT/foam2
cp -r nanopay $WEBAPPS/ROOT/nanopay
cp -r merchant $WEBAPPS/ROOT/merchant
cp -r favicon $WEBAPPS/ROOT/favicon

# Move images to ROOT/images
rmdir $WEBAPPS/ROOT/images
mkdir $WEBAPPS/ROOT/images
cp -r $WEBAPPS/ROOT/nanopay/src/net/nanopay/images $WEBAPPS/ROOT
cp -r $WEBAPPS/ROOT/merchant/src/net/nanopay/merchant/images $WEBAPPS/ROOT

rmdir $WEBAPPS/ROOT/foam2/src/com

ARGS=
if [ $DEBUG -eq 1 ]; then
    ARGS="jpda"
fi

if [ $FOREGROUND -eq 1 ]; then
    ARGS="$ARGS run"
else
    ARGS="$ARGS start"
fi

$CATALINA_HOME/bin/catalina.sh $ARGS
