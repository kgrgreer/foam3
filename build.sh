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

function quit {
  # Unset error on exit
  set +e
  exit $1
}

function install {
    MACOS='darwin*'

    cd "$PROJECT_HOME"

    git submodule init
    git submodule update

    npm install

    setenv

    setup_jce

    if [[ $IS_MAC -eq 1 ]]; then
        mkdir -p "$NANOPAY_HOME/journals"
        mkdir -p "$NANOPAY_HOME/logs"
    fi

    # git hooks
    git config core.hooksPath .githooks
    git config submodule.recurse true
}

function backup {
  if [[ ! $PROJECT_HOME == "/pkg/stack/stage/NANOPAY" ]]; then
    # Preventing this from running on non AWS
    return
  fi

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

function setup_jce {
  local JAVA_LIB_SECURITY="$JAVA_HOME/lib/security"

  # For Java 8; including on linux
  if [[ $JAVA_LIB_SECURITY = *"_"* || $JAVA_LIB_SECURITY = *"java-8-oracle"* ]]; then
    JAVA_LIB_SECURITY="$JAVA_HOME/jre/lib/security"
  fi

  if [[ ! -f $JAVA_LIB_SECURITY/local_policy.jar && ! -f $JAVA_LIB_SECURITY/US_export_policy.jar ]]; then
    mkdir tmp_jce
    cd tmp_jce
    curl -L -H "Cookie:oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jce/8/jce_policy-8.zip > jce_policy-8.zip
    unzip jce_policy-8.zip
    sudo cp UnlimitedJCEPolicyJDK8/local_policy.jar UnlimitedJCEPolicyJDK8/US_export_policy.jar $JAVA_LIB_SECURITY/
    cd ..
    rm -rf tmp_jce

    if [[ $(jrunscript -e "print (javax.crypto.Cipher.getMaxAllowedKeyLength('AES') >= 256)") = "true" ]]; then
      echo "INFO :: Java Cryptography Extension (JCE) Unlimited Strength Jurisdiction Policy files setup successfully."
    else
      echo "ERROR :: Java Cryptography Extension (JCE) Unlimited Strength Jurisdiction Policy files failed to setup successfully."
    fi
  fi
}

function deploy_journals {
    # prepare journals
    cd "$PROJECT_HOME"

    if [ -f "$JOURNAL_HOME" ] && [ ! -d "$JOURNAL_HOME" ]; then
        # remove journal file that find.sh was previously creating
        rm "$JOURNAL_HOME"
    fi

    mkdir -p "$JOURNAL_OUT"
    JOURNALS="$JOURNAL_OUT/journals"
    touch "$JOURNALS"
    ./find.sh "$PROJECT_HOME" "$JOURNAL_OUT" $IS_AWS

    if [[ ! -f $JOURNALS ]]; then
        echo "ERROR :: Missing $JOURNALS file."
        quit 1
    fi

    while read file; do
        journal_file="$file".0
        if [ -f "$JOURNAL_OUT/$journal_file" ]; then
            cp "$JOURNAL_OUT/$journal_file" "$JOURNAL_HOME/$journal_file"
        fi
    done < $JOURNALS
}

function migrate_journals {
    if [ -f "tools/migrate_journals.sh" ]; then
        ./tools/migrate_journals.sh
    fi
}

function build_jar {
    echo "INFO :: Building nanos JAR..."
    cd "$PROJECT_HOME"

    if [[ "$CLEAN_BUILD" -eq 1 || "$TEST" -eq 1 ]]; then
        if [ -d "build/" ]; then
            rm -rf build
            mkdir build
        fi

        mvn clean
    fi

    ./gen.sh
    mvn package
}

function build_foam {
    cd "$PROJECT_HOME/foam2"
    make
}

function delete_runtime_journals {
  if [[ $DELETE_RUNTIME_JOURNALS -eq 1 && IS_AWS -eq 0 ]]; then
    echo "INFO :: Runtime journals deleted."
    rmdir "$JOURNAL_HOME"
    mkdir -p "$JOURNAL_HOME"
  fi
}

function delete_runtime_logs {
  if [[ $DELETE_RUNTIME_LOGS -eq 1 && IS_AWS -eq 0 ]]; then
    echo "INFO :: Runtime logs deleted."
    rmdir "$LOG_HOME"
    mkdir -p "$LOG_HOME"
  fi
}

function stop_nanos {
    echo "INFO :: Stopping nanos..."

    RUNNING_PID=$(ps -ef | grep -v grep | grep "java.*-DNANOPAY_HOME" | awk '{print $2}')
    if [[ -f $NANOS_PIDFILE ]]; then
        PID=$(cat "$NANOS_PIDFILE")
        if [[ "$PID" != "$RUNNING_PID" ]]; then
            PID=$RUNNING_PID
        fi
    else
        PID=$RUNNING_PID
    fi

    if [[ -z "$PID" ]]; then
        echo "INFO :: PID and/or file $NANOS_PIDFILE not found, nothing to stop?"
        delete_runtime_journals
        delete_runtime_logs
        return
    fi

    TRIES=0
    SIGNAL=TERM
    set +e
    while kill -0 $PID &>/dev/null; do
        kill -$SIGNAL $PID
        sleep 1
        TRIES=$(($TRIES + 1))
        if [ $TRIES -gt 5 ]; then
            SIGNAL=KILL
        elif [ $TRIES -gt 10 ]; then
            echo "ERROR :: Failed to kill nanos!"
            quit 1
        fi
    done
    set -e

    rmfile "$NANOS_PIDFILE"

    backup
    delete_runtime_journals
    delete_runtime_logs
}

function status_nanos {
    if [ ! -f "$NANOS_PIDFILE" ]; then
        echo "INFO :: Nanos not running."
        quit 1
    elif kill -0 $(cat "$NANOS_PIDFILE") &>/dev/null ; then
        echo "INFO :: Nanos running."
        quit 0
    else
        echo "ERROR :: Stale PID file."
        quit -1
    fi
}

function start_nanos {
    echo "INFO :: Starting nanos..."

    cd "$PROJECT_HOME"
    ./find.sh "$PROJECT_HOME" "$JOURNAL_OUT"
    deploy_journals

    if [ $DEBUG -eq 1 ]; then
        JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=${DEBUG_SUSPEND},address=${DEBUG_PORT} ${JAVA_OPTS}"
    fi

    # If not running on AWS, serve current directory.
    if [ $IS_AWS -eq 0 ]; then
        JAVA_OPTS="-Dnanos.webroot=\"${PWD}\" ${JAVA_OPTS}"
    fi

    if [ $DAEMONIZE -eq 0 ]; then
        exec java $JAVA_OPTS -jar target/root-0.0.1.jar
    else
        nohup java $JAVA_OPTS -jar target/root-0.0.1.jar &>/dev/null &
        echo $! > "$NANOS_PIDFILE"
    fi
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
    if [ -z "$NANOPAY_HOME" ]; then
        export NANOPAY_HOME="/opt/nanopay"
    fi

    if [[ ! -w $NANOPAY_HOME && $TEST -ne 1 ]]; then
        echo "ERROR :: $NANOPAY_HOME is not writable! Please run 'sudo chown -R $USER /opt' first."
        quit 1
    fi

    if [ -z "$LOG_HOME" ]; then
        LOG_HOME="$NANOPAY_HOME/logs"
    fi

    local MACOS='darwin*'
    local LINUXOS='linux-gnu'
    IS_MAC=0
    IS_LINUX=0

    if [[ $OSTYPE =~ $MACOS ]]; then
      IS_MAC=1
    elif [[ $OSTYPE =~ $LINUXOS ]]; then
      IS_LINUX=1
    fi

    export PROJECT_HOME="$( cd "$(dirname "$0")" ; pwd -P )"

    export JOURNAL_OUT="$PROJECT_HOME"/target/journals

    export JOURNAL_HOME="$NANOPAY_HOME/journals"

    export NANOS_PIDFILE="/tmp/nanos.pid"

    if beginswith "/pkg/stack/stage" $0 || beginswith "/pkg/stack/stage" $PWD ; then
        PROJECT_HOME=/pkg/stack/stage/NANOPAY
        cd "$PROJECT_HOME"
        cwd=$(pwd)
        npm install

        mkdir -p "$NANOPAY_HOME"

        # Production use S3 mount
        #if [[ -d "/mnt/journals" ]]; then
        # FIXME: test and don't create if it exists
        #   ln -sn "$JOURNAL_HOME" "/mnt/journals"
        #else
            mkdir -p "$JOURNAL_HOME"
        #fi

        CLEAN_BUILD=1
        IS_AWS=1

        mkdir -p "$LOG_HOME"
    elif [[ ! -d "$JOURNAL_HOME" ]]; then
        mkdir -p $JOURNAL_HOME
        mkdir -p $LOG_HOME
    fi

    if [[ $TEST -eq 1 ]]; then
        rmdir /tmp/nanopay
        mkdir /tmp/nanopay
        JOURNAL_HOME=/tmp/nanopay
        mkdir -p $JOURNAL_HOME
        echo "INFO :: Cleaned up temporary journal files."
    fi

    WAR_HOME="$PROJECT_HOME"/target/root-0.0.1

    if [ -z "$JAVA_OPTS" ]; then
        export JAVA_OPTS=""
    fi
    JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=$NANOPAY_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=$LOG_HOME"

    # keystore
    if [[ -f $PROJECT_HOME/tools/keystore.sh ]]; then
        cd "$PROJECT_HOME"
        printf "INFO :: Generating keystore...\n"
        if [[ $TEST -eq 1 ]]; then
          ./tools/keystore.sh -t
        else
          ./tools/keystore.sh
        fi
    fi

    if [[ -z $JAVA_HOME ]]; then
      if [[ $IS_MAC -eq 1 ]]; then
        JAVA_HOME=$($(dirname $(readlink $(which javac)))/java_home)
      elif [[ $IS_LINUX -eq 1 ]]; then
        JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
      fi
    fi

    # Check if connected to the interwebs
    ping -q -W1 -c1 google.com &>/dev/null && INTERNET=1 || INTERNET=0
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -b : Build but don't start nanos."
    echo "  -c : Clean generated code before building.  Required if generated classes have been removed."
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -f : Build foam."
    echo "  -g : Output running/notrunning status of daemonized nanos."
    echo "  -h : Print usage information."
    echo "  -i : Install npm and git hooks"
    echo "  -j : Delete runtime journals, build, and run app as usual."
    echo "  -l : Delete runtime log, build, and run app as usual."
    echo "  -m : Run migration scripts"
    echo "  -r : Start nanos with whatever was last built."
    echo "  -s : Stop a running daemonized nanos."
    echo "  -S : When debugging, start suspended."
    echo "  -t : Run tests."
    echo "  -z : Daemonize into the background, will write PID into $PIDFILE environment variable."
    echo ""
    echo "No options implys -b and -s, (build and then start)."
}

############################

BUILD_ONLY=0
BUILD_FOAM=0
CLEAN_BUILD=0
DEBUG=0
DEBUG_PORT=8000
DEBUG_SUSPEND=n
JAVA_OPTS=
INSTALL=0
RUN_MIGRATION=0
START_ONLY=0
TEST=0
IS_AWS=0
DAEMONIZE=0
STOP_ONLY=0
RESTART=0
STATUS=0
DELETE_RUNTIME_JOURNALS=0
DELETE_RUNTIME_LOGS=0

while getopts "bcdfghijlmrsStz" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        c) CLEAN_BUILD=1 ;;
        d) DEBUG=1 ;;
        f) BUILD_FOAM=1 ;;
        g) STATUS=1 ;;
        h) usage ; quit 0 ;;
        i) INSTALL=1 ;;
        j) DELETE_RUNTIME_JOURNALS=1 ;;
        l) DELETE_RUNTIME_LOGS=1 ;;
        m) RUN_MIGRATION=1 ;;
        r) START_ONLY=1 ;;
        s) STOP_ONLY=1 ;;
        t) TEST=1 ;;
        z) DAEMONIZE=1 ;;
        S) DEBUG_SUSPEND=y ;;
        ?) usage ; quit 1 ;;
    esac
done

setenv

if [[ $INSTALL -eq 1 ]]; then
    install
    quit 0
fi

if [[ $TEST -eq 1 ]]; then
  echo "INFO :: Running all tests..."
  shift $((OPTIND - 1))
  # Remove the opts processed variables.
  TESTS="$@"
  # Replacing spaces with commas.
  TESTS=${TESTS// /,}
  JAVA_OPTS="${JAVA_OPTS} -Dfoam.main=testRunnerScript -Dfoam.tests=${TESTS}"

fi

if [[ $DIST -eq 1 ]]; then
    dist
    quit 0
fi

if [ "$BUILD_FOAM" -eq 1 ]; then
    build_foam
elif [ "$BUILD_ONLY" -eq 1 ]; then
    build_jar
    deploy_journals
elif [ "$RUN_MIGRATION" -eq 1 ]; then
    migrate_journals
elif [ "$START_ONLY" -eq 1 ]; then
    stop_nanos
    start_nanos
elif [ "$STOP_ONLY" -eq 1 ]; then
    stop_nanos
elif [ "$STATUS" -eq 1 ]; then
    status_nanos
else
    build_jar
    deploy_journals
    stop_nanos
    start_nanos
fi

quit 0
