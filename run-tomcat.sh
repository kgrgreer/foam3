#!/bin/sh
# Exit on first failure
#set -e

NANOPAY_HOME=$(dirname $0)

function testcatalina {
    if [ -x "$1/bin/catalina.sh" ]; then
        printf "found. ( $1 )\n"
        export CATALINA_HOME="$1"
        export CATALINA_PID="/tmp/catalina_pid"
        touch "$CATALINA_PID"
    fi
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -r : Just restart the existing running Tomcat. "
    echo "  -f : Run in foreground."
    echo "  -h : Print usage information."
}

function rmdir {
    if test -d "$1" ; then
        rm -rf "$1"
    fi
}

function rmfile {
    if test -f "$1" ; then
        rm -f "$1"
    fi
}

function status_tomcat {
    ps -a | grep -v grep | grep "java.*-Dcatalina.home=$CATALINA_HOME" > /dev/null
    return $?
}

function shutdown_tomcat {
    #
    # Don't call shutdown.sh if the pid doesn't exists, it will exit.
    #
    PID="$(cat "$CATALINA_PID")"
    if [ ! -z "${PID}" ]; then
        if ps -p "${PID}" | grep -q 'java'; then
            "$CATALINA_HOME/bin/shutdown.sh" "-force" > /dev/null 2>&1
        fi
    fi

    if status_tomcat -eq "0"; then
        printf "killing tomcat..."
        kill $(ps -ef | grep -v grep | grep "java.*-Dcatalina.home=$CATALINA_HOME" | awk '{print $2}')
        wait_time=15
        while status_tomcat -eq "0"
        do
            if [ "$wait_time" -eq "0" ]; then
                break;
            fi
            wait_time=$(($wait_time - 1))

            printf "."
            sleep 1;
        done
        if status_tomcat -eq "0"; then
            printf "failed to kill tomcat process.\n"
            exit 1
        else
            printf "killed.\n"
        fi
    fi
}

function build_NANOPAY_into_tomcat {
    WEBAPPS="$CATALINA_HOME/webapps"

    cd "$NANOPAY_HOME"

    ./gen.sh
    mvn clean install

    # Copy over war and server config files.
    # These are needed before server startup
    rmfile "$WEBAPPS/ROOT.war"
    rmdir "$WEBAPPS/ROOT"

    unzip "$NANOPAY_HOME/target/ROOT.war" -d "$WEBAPPS/ROOT"

    cd "$NANOPAY_HOME"
    ./find.sh

    #
    # NOTE: journal.0 is not presently possible for tomcat on localhost.
    # It will require application changes to set/configure java's user.dir,
    # so for now journals are only recreated on a regular start, and
    # preserved with option -r
    #
    # # Copy repository journals
    # JOURNALS='journals'
    # if [ ! -f $JOURNALS ]; then
    #     echo "ERROR: missing $JOURNALS file."
    #     exit 1
    # fi

    # while read journal; do
    #     cp "$journal" "$CATALINA_HOME/bin/$journal.0"
    # done < $JOURNALS

    # Some older scripts may have copied foam2/nanopay/merchant as their own webapps.
    rmdir "$WEBAPPS/foam2"
    rmdir "$WEBAPPS/nanopay"
    rmdir "$WEBAPPS/merchant"

    # Copy over static web files to ROOT
    cp -r foam2 "$WEBAPPS/ROOT/foam2"
    cp -r interac/src/net "$WEBAPPS/ROOT/foam2/src/"
    cp -r nanopay "$WEBAPPS/ROOT/nanopay"
    cp -r merchant "$WEBAPPS/ROOT/merchant"
    cp -r favicon "$WEBAPPS/ROOT/favicon"

    # Move images to ROOT/images
    rmdir "$WEBAPPS/ROOT/images"
    mkdir "$WEBAPPS/ROOT/images"
    cp -r "$WEBAPPS/ROOT/nanopay/src/net/nanopay/images" "$WEBAPPS/ROOT"
    cp -r "$WEBAPPS/ROOT/merchant/src/net/nanopay/merchant/images" "$WEBAPPS/ROOT"

    rmdir "$WEBAPPS/ROOT/foam2/src/com"
}

function start_tomcat {
    if status_tomcat -eq "0"; then
        echo "instance of tomcat already running.\n"
        exit 1
    else 
        ARGS=
        if [ $DEBUG -eq 1 ]; then
            ARGS="jpda"
        fi

        if [ $FOREGROUND -eq 1 ]; then
            ARGS="$ARGS run"
        else
            ARGS="$ARGS start"
        fi

        "$CATALINA_HOME/bin/catalina.sh" $ARGS
    fi
}

while [ -z "$CATALINA_HOME" ]; do
    printf "Searching for catalina... "
    testcatalina /Library/Tomcat
    if [ ! -z "$CATALINA_HOME" ]; then
        break
    fi
    testcatalina "$HOME/tools/tomcat"
    if [ ! -z "$CATALINA_HOME" ]; then
        break
    fi
    printf "not found.\n"
    printf "Set CATALINA_HOME environment variable to the location of Tomcat."
    exit 1
done

DEBUG=0
FOREGROUND=0
RESTART_ONLY=0
while getopts "dfhr" opt ; do
    case $opt in
        d) DEBUG=1 ;;
        f) FOREGROUND=1 ;;
        r) RESTART_ONLY=1 ;;
        h) usage ; exit 0 ;;
        ?) usage ; exit 1 ;;
    esac
done


#Shutdown tomcat if already running
shutdown_tomcat
[ $RESTART_ONLY -eq 1 ] || build_NANOPAY_into_tomcat
start_tomcat
