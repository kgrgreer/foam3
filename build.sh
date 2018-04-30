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

function install {
    # Only support MacOS install/setup
    if [ "$OSTYPE" != darwin17 ]; then
        return
    fi

    cd "$NANOPAY_HOME"

    git submodule init
    git submodule update

    npm install

    cd tools
    ./tomcatInstall.sh

    setenv
    set_doc_base
}

function set_doc_base {
    # setup docbase
    # <Host>
    #    <Context docBase="$catalina_doc_base" path="/dev" />
    # </Host>
    if [ -f "$CATALINA_HOME/conf/server.xml" ]; then
        if ! grep -q "docBase" "$CATALINA_HOME/conf/server.xml"; then
            printf "adding docBase\n"
            # TODO: figure how ot insert \n before <\Host> on macos
            sed -i -e "s,</Host>,<Context docBase=\"\${catalina_doc_base}\" path=\"/dev\" /></Host>,g" "$CATALINA_HOME/conf/server.xml"
        else
            sed -i -e "s,docBase=.*path=,docBase=\"\${catalina_doc_base}\" path=,g" "$CATALINA_HOME/conf/server.xml"
        fi
    fi
}

function backup {
    BACKUP_HOME="/opt/backup"

    # backup journals in event of file incompatiblity between versions
    if [ "$OSTYPE" == "linux-gnu" ] && [ ! -z "${BACKUP_HOME+x}" ] && [ -d "$JOURNAL_HOME" ]; then
        printf "backup\n"
        DATE=$(date +%Y%m%d_%H%M%S)
        mkdir -p "$BACKUP_HOME/$DATE"
        COUNT="$(ls -l $CATALINA_HOME/bin/ | grep -v '.0' | wc -l | sed 's/ //g')"

        cp -r "$JOURNAL_HOME/" "$BACKUP_HOME/$DATE/"
    fi
}

function build_war {
    #
    # NOTE: this removes the target directory where journal preparation occurs.
    # invoke deploY_journals after build_war
    #
    if [ "$CLEAN_BUILD" -eq 1 ]; then
      mvn clean

      cd "$NANOPAY_HOME"

      # Copy over static web files to ROOT
      mkdir -p "$WAR_HOME"

      cp -r foam2 "$WAR_HOME"
      rm -r "$WAR_HOME/foam2/src/com"
      cp -r interac/src/net "$WAR_HOME/foam2/src/"
      cp -r nanopay "$WAR_HOME"
      cp -r merchant "$WAR_HOME"
      cp -r favicon "$WAR_HOME"

      # Move images to ROOT/images
      mkdir -p "$WAR_HOME/images"
      cp -r "nanopay/src/net/nanopay/images" "$WAR_HOME"
      cp -r "merchant/src/net/nanopay/merchant/images" "$WAR_HOME"
    fi

    # build and create war
    ./gen.sh
    if [ "$CLEAN_BUILD" -ne 1 ]; then
      mvn install -Dbuild=dev -o
    else
      mvn install
    fi
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

    if [ -f "$JOURNAL_HOME" ] && [ ! -d "$JOURNAL_HOME" ]; then
        # remove journal file that find.sh was previously creating
        rm "$JOURNAL_HOME"
    fi

    mkdir -p "$JOURNAL_OUT"
    JOURNALS="$JOURNAL_OUT/journals"
    touch "$JOURNALS"
    ./find.sh "$NANOPAY_HOME" "$JOURNAL_OUT"

    if [ ! -f $JOURNALS ]; then
        echo "ERROR: missing $JOURNALS file."
        exit 1
    fi

    while read file; do
        journal_file="$file".0
        if [ -f "$JOURNAL_OUT/$journal_file" ]; then
            cp "$JOURNAL_OUT/$journal_file" "$JOURNAL_HOME/$journal_file"
        fi
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
                    if [ ! -f "$JOURNAL_HOME/$file" ] && [ -f "$CATALINA_HOME/bin/$file" ]; then
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

    if [ "$DELETE_RUNTIME_JOURNALS" -eq 1 ]; then
        rmdir "$JOURNAL_HOME"
        mkdir -p "$JOURNAL_HOME"
    fi
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
        mkdir -p "$CATALINA_BASE/logs"
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
    java $JAVA_OPTS -cp `cat cp.txt`:`realpath target/*.jar | paste -sd ":" -` foam.nanos.boot.Boot
}

function testcatalina {
    if [ -x "$1/bin/catalina.sh" ]; then
        #printf "found. ( $1 )\n"
        export CATALINA_HOME="$1"
    fi
}

function beginswith {
    # https://stackoverflow.com/a/18558871
    case $2 in "$1"*) true;; *) false;; esac;
}

function setenv {

    NANOPAY_HOME="$( cd "$(dirname "$0")" ; pwd -P )"

    # if running via CodeDeploy set -c flag
    if beginswith /pkg/stack/stage "$NANOPAY_HOME"; then
        CLEAN_BUILD=1
    fi

    JOURNAL_OUT="$NANOPAY_HOME"/target/journals

    if [ -z "$JOURNAL_HOME" ]; then
       JOURNAL_HOME="$NANOPAY_HOME/journals"
    fi

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

    if [ -z "$CATALINA_BASE" ]; then
        export CATALINA_BASE="$CATALINA_HOME"
    fi
    if [ -z "$CATALINA_PORT_HTTP" ]; then
        export CATALINA_PORT_HTTP=8080
    fi
    if [ -z "$CATALINA_PORT_HTTPS" ]; then
        export CATALINA_PORT_HTTPS=8443
    fi
    if [ -z "$CATALINA_DOC_BASE" ]; then
        export CATALINA_DOC_BASE="$NANOPAY_HOME"
    fi
    if [ -f "$JOURNAL_HOME" ] && [ ! -d "$JOURNAL_HOME" ]; then
        # remove journal file that find.sh was creating
        rm "$JOURNAL_HOME"
    fi
    mkdir -p $JOURNAL_HOME

    WAR_HOME="$NANOPAY_HOME"/target/root-0.0.1

    if [ -z "$JAVA_OPTS" ]; then
        export JAVA_OPTS=""
    fi
    JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=$CATALINA_BASE/logs"

    if [ -z "$CATALINA_OPTS" ]; then
        export CATALINA_OPTS=""
    fi
    CATALINA_OPTS="${CATALINA_OPTS} -Dcatalina_port_http=${CATALINA_PORT_HTTP}"
    CATALINA_OPTS="${CATALINA_OPTS} -Dcatalina_port_https=${CATALINA_PORT_HTTPS}"
    CATALINA_OPTS="${CATALINA_OPTS} -Dcatalina_doc_base=${CATALINA_DOC_BASE}"
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -b : Generate source, compile, and deploy war and journals."
    echo "  -c : Generate source and compile. Run maven under the default-build profile."
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -j : Delete runtime journals"
    echo "  -i : Install npm and tomcat libraries"
    echo "  -n : Run nanos."
    echo "  -r : Just restart the existing running Tomcat."
    echo "  -s : Stop Tomcat."
    echo "  -f : Run Tomcat in foreground."
    echo "  -h : Print usage information."
}

############################

BUILD_ONLY=0
CLEAN_BUILD=0
DEBUG=0
FOREGROUND=0
DELETE_RUNTIME_JOURNALS=0
INSTALL=0
RESTART_ONLY=0
RUN_NANOS=0
STOP_TOMCAT=0

while getopts "bcdfhijnrs" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        c) CLEAN_BUILD=1 ;;
        d) DEBUG=1 ;;
        f) FOREGROUND=1 ;;
        j) DELETE_RUNTIME_JOURNALS=1 ;;
        i) INSTALL=1 ;;
        n) RUN_NANOS=1 ;;
        r) RESTART_ONLY=1 ;;
        s) STOP_TOMCAT=1 ;;
        h) usage ; exit 0 ;;
        ?) usage ; exit 1 ;;
    esac
done

setenv
if [ "$INSTALL" -eq 1 ]; then
    install
    exit 0
fi
if [ "$RUN_NANOS" -eq 1 ]; then
    start_nanos
elif [ "$BUILD_ONLY" -eq 1 ]; then
    build_war
    deploy_journals
elif [ "$STOP_TOMCAT" -eq 1 ]; then
    shutdown_tomcat
    printf "Tomcat stopped.\n"
else
    shutdown_tomcat
    if [ "$RESTART_ONLY" -eq 0 ]; then
        build_war
        undeploy_war
        deploy_journals
        if [ "$FOREGROUND" -eq 1 ]; then
            deploy_war
            start_tomcat
        else
            #
            # NOTE: Tomcat needs to be running to property unpack and deploy war
            # on the linux production instances. Either work on macos localhost.
            #
            start_tomcat
            deploy_war
        fi
    else
        start_tomcat
    fi
fi

exit 0
