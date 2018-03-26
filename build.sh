#!/bin/bash
#
# Deploy nanopay application
#
# See options for quick compile cycles without complete deployment.
#

# Exit on first failure
set -e

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

function backup {
    BACKUP_HOME="/opt/backup"

    # backup journals in event of file incompatiblity between versions
    if [ "$OSTYPE" == "linux-gnu" ] && [ ! -z "${BACKUP_HOME+x}" ]; then
        printf "backup\n"
        DATE=$(date +%Y%m%d_%H%M%S)
        mkdir -p "$BACKUP_HOME/$DATE"
        COUNT="$(ls -l $CATALINA_HOME/bin/ | grep -v '.0' | wc -l | sed 's/ //g')"

        cp -r "$JOURNAL_HOME/" "$BACKUP_HOME/$DATE/"
    fi
}

function gen_and_compile {
    mvn clean
    ./gen.sh
    mvn compile
}

function build_war {
    #
    # NOTE: this removes the target directory where journal preparation occurs.
    # invoke deploY_journals after build_war
    #
    mvn clean

    cd "$NANOPAY_HOME"

    # Copy over static web files to ROOT
    mkdir -p "$WAR_HOME"

    cp -r foam2 "$WAR_HOME/foam2"
    rm -r "$WAR_HOME/foam2/src/com"
    cp -r interac/src/net "$WAR_HOME/foam2/src/"
    cp -r nanopay "$WAR_HOME/nanopay"
    cp -r merchant "$WAR_HOME/merchant"
    cp -r favicon "$WAR_HOME/favicon"

    # Move images to ROOT/images
    mkdir -p "$WAR_HOME/images"
    cp -r "nanopay/src/net/nanopay/images" "$WAR_HOME"
    cp -r "merchant/src/net/nanopay/merchant/images" "$WAR_HOME"

    # build and create war
    ./gen.sh
    mvn install
}

function undeploy_war {
    if [ -d "$CATALINA_BASE/webapps/ROOT" ]; then
        rm -r "$CATALINA_BASE/webapps/ROOT"
    fi
}

function deploy_war {
    #
    # NOTE: war must be named ROOT.war
    # otherwise some other Tomcat configuration is required that I've
    # yet to figure out.
    #
    cp "$WAR_HOME"/../ROOT.war "$CATALINA_BASE/webapps/ROOT.war.tmp"
    mv "$CATALINA_BASE/webapps/ROOT.war.tmp" "$CATALINA_BASE/webapps/ROOT.war"

    # required when tomcat is not running when war copied into place
    #mkdir -p "$CATALINA_BASE/webapps/NANOPAY"
    #cd "$CATALINA_BASE/webapps/NANOPAY"
    #jar -xf ../NANOPAY.war
}

function deploy_journals {
    # prepare journals
    cd "$NANOPAY_HOME"
    mkdir -p "$JOURNAL_OUT"

    ./find.sh "$NANOPAY_HOME" "$JOURNAL_OUT"
    JOURNALS="$JOURNAL_OUT/journals"
    touch "$JOURNALS"
    if [ ! -f $JOURNALS ]; then
        echo "ERROR: missing $JOURNALS file."
        exit 1
    fi

    #cp "$JOURNAL_OUT/"* "$JOURNAL_HOME/"
    while read file; do
        journal_file="$file".0
        cp "$JOURNAL_OUT/$journal_file" "$JOURNAL_HOME/$journal_file"
    done < $JOURNALS

    # one-time copy of runtime journals from /opt/tomcat/bin to /mnt/journals
    if [ "$CATALINA_HOME" == "/opt/tomcat" ]; then
        COUNT="$(ls -l $JOURNAL_HOME | grep -v '.0' | wc -l | sed 's/ //g')"
        if [ "$COUNT" -eq 0 ]; then
            printf "migrating journals\n"

            JOURNALS="$JOURNAL_OUT/journals"
            if [ -f $JOURNALS ]; then
                # move non journal.zero files
                while read file; do
                    # one last check, just in case
                    if [ ! -f "$JOURNAL_HOME/$file" ]; then
                        cp "$CATALINA_HOME/bin/$file" "$JOURNAL_HOME/$file" 2>/dev/null
                    fi
                done < $JOURNALS
            fi
        fi
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

    if status_tomcat -eq 0 ; then
        printf "killing tomcat..."
        kill $(ps -ef | grep -v grep | grep "java.*-Dcatalina.home=$CATALINA_HOME" | awk '{print $2}')
        wait_time=15
        while status_tomcat -eq 0
        do
            if [ "$wait_time" -eq 0 ]; then
                break;
            fi
            wait_time=$(($wait_time - 1))

            printf "."
            sleep 1;
        done
        if status_tomcat -eq 0 ; then
            printf "failed to kill tomcat process.\n"
            exit 1
        else
            printf "killed.\n"
        fi
    fi

    backup
}

function start_tomcat {
    if status_tomcat -eq 0; then
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

        #
        # NOTE: cd to CATALINA_BASE/logs, as this will become
        # System property 'user.dir', which, for now is the
        # only way to control where the nano.log is created.
        #
        cd "$CATALINA_BASE/logs"
        "$CATALINA_HOME/bin/catalina.sh" $ARGS
    fi
}

function start_nanos {
    printf "starting nanos\n"

    command -v realpath >/dev/null 2>&1 || {
        echo >&2 "'realpath' required but it's not installed.  Aborting.";
        exit 1;
    }

    cd "$NANOPAY_HOME"
    mvn clean
    ./find.sh "$NANOPAY_HOME" "$JOURNAL_OUT"
    ./gen.sh
    mvn install
    mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;
    deploy_journals
    java -cp `cat cp.txt`:`realpath target/*.jar | paste -sd ":" -` foam.nanos.boot.Boot
}

function testcatalina {
    if [ -x "$1/bin/catalina.sh" ]; then
        #printf "found. ( $1 )\n"
        export CATALINA_HOME="$1"
        export CATALINA_BASE="$CATALINA_HOME"
    fi
}

function setenv {

    NANOPAY_HOME="$( cd "$(dirname "$0")" ; pwd -P )"
    JOURNAL_OUT="$NANOPAY_HOME"/target/journals
    JOURNAL_HOME=/tmp/journals

    if [ "$OSTYPE" == "linux-gnu" ]; then
        NANOPAY_HOME=/pkg/stack/stage/NANOPAY
        cd "$NANOPAY_HOME"
        cwd=$(pwd)
        npm install

        # Production use S3 mount
        JOURNAL_HOME=/mnt/journals
    fi

    export CATALINA_PID="/tmp/catalina_pid"
    touch "$CATALINA_PID"

    while [ -z "$CATALINA_HOME" ]; do
        #printf "Searching for catalina... "
        testcatalina /Library/Tomcat
        if [ ! -z "$CATALINA_HOME" ]; then
            break
        fi
        testcatalina /opt/tomcat
        if [ ! -z "$CATALINA_HOME" ]; then
            # TODO: place on S3 mount
            break;
        fi
        testcatalina "$HOME/tools/tomcat"
        if [ ! -z "$CATALINA_HOME" ]; then
            break
        fi
        printf "CATALINA_HOME not found.\n"
        printf "Set CATALINA_HOME environment variable to the location of Tomcat."
        exit 1
    done

    mkdir -p $JOURNAL_HOME

    WAR_HOME="$NANOPAY_HOME"/target/root-0.0.1

    export JAVA_OPTS=""
    JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=$CATALINA_BASE/logs"
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -b : Generate source, compile, and deploy war and journals."
    echo "  -c : Generate source and compile."
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -n : Run nanos."
    echo "  -r : Just restart the existing running Tomcat."
    echo "  -s : Stop Tomcat."
    echo "  -f : Run Tomcat in foreground."
    echo "  -h : Print usage information."
}

############################

BUILD_ONLY=0
COMPILE_ONLY=0
DEBUG=0
FOREGROUND=0
RESTART_ONLY=0
RUN_NANOS=0
STOP_TOMCAT=0

while getopts "bcdfhnrs" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        c) COMPILE_ONLY=1 ;;
        d) DEBUG=1 ;;
        f) FOREGROUND=1 ;;
        n) RUN_NANOS=1 ;;
        r) RESTART_ONLY=1 ;;
        s) STOP_TOMCAT=1 ;;
        h) usage ; exit 0 ;;
        ?) usage ; exit 1 ;;
    esac
done

setenv

if [ "$RUN_NANOS" -eq 1 ]; then
    start_nanos
elif [ "$BUILD_ONLY" -eq 1 ]; then
    build_war
    deploy_journals
elif [ "$COMPILE_ONLY" -eq 1 ]; then
    gen_and_compile
elif [ "$STOP_TOMCAT" -eq 1 ]; then
    shutdown_tomcat
    printf "Tomcat stopped.\n"
else
    shutdown_tomcat
    if [ "$RESTART_ONLY" -eq 0 ]; then
        build_war
        undeploy_war
        deploy_journals
        #
        # NOTE: Tomcat needs to be running to property unpack and deploy war.
        #
        start_tomcat
        deploy_war
    else
        start_tomcat
    fi
fi

exit 0
