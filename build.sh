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
    echo "INFO :: Deploying Journals"

    # prepare journals
    cd "$PROJECT_HOME"

    JOURNALS=tools/journals
    if [[ ! -f  $JOURNALS ]]; then
        echo "ERROR :: Missing ${JOURNALS} file."
        quit 1
    fi

    if [ ! -d target ]; then
        mkdir -p target
    fi

    if [ "$GRADLE_BUILD" -eq 0 ] || [ "$DELETE_RUNTIME_JOURNALS" -eq 1 ] || [ $CLEAN_BUILD -eq 1 ]; then
        ./tools/findJournals.sh -J${JOURNAL_CONFIG} < $JOURNALS | ./find.sh -O${JOURNAL_OUT}
    else
        ./tools/findJournals.sh -J${JOURNAL_CONFIG} < $JOURNALS > target/journal_files
        gradle findSH -PjournalOut=${JOURNAL_OUT} -PjournalIn=target/journal_files --daemon $GRADLE_FLAGS
    fi

    if [[ $? -eq 1 ]]; then
        quit 1
    fi

    if [ "$LIQUID_DEMO" -eq 1 ]; then
        node tools/liquid_journal_script.js

        if [[ $? -eq 1 ]]; then
            quit 1
        fi
    fi

    if [ "$RUN_JAR" -eq 0 ]; then
        while read -r file; do
            journal_file="$file".0
            if [ -f "$JOURNAL_OUT/$journal_file" ]; then
                cp "$JOURNAL_OUT/$journal_file" "$JOURNAL_HOME/$journal_file"
            fi
        done < $JOURNALS
    fi
}

function migrate_journals {
    if [ -f "tools/migrate_journals.sh" ]; then
        ./tools/migrate_journals.sh "$JOURNAL_HOME"
    fi
}

function clean {
    if [ "$CLEAN_BUILD" -eq 1 ] &&
           [ "$RESTART_ONLY" -eq 0 ]; then
        echo "INFO :: Cleaning Up"

        if [ "${RUN_JAR}" -eq 1 ]; then
            tmp=$PWD
            echo PWD=$tmp
            cd "${NANOPAY_HOME}/bin"
            rm -rf *
            cd "../lib"
            rm -rf *
            cd "$tmp"
        fi

        if [ "$GRADLE_BUILD" -eq 0 ]; then
            if [ -d "build/" ]; then
                rm -rf build
                mkdir build
            fi
            if [ -d "target/" ]; then
                rm -rf target
                mkdir target
            fi
            if [ -d "generatedJava/" ]; then
                rm -rf generatedJava
                mkdir generatedJava
            fi
            mvn clean
        else
            gradle clean $GRADLE_FLAGS
        fi
    fi
}

function build_jar {
    if [ "$GRADLE_BUILD" -eq 1 ]; then
        if [ "$TEST" -eq 1 ] || [ "$RUN_JAR" -eq 1 ]; then
            gradle --daemon buildJar $GRADLE_FLAGS
        else
            gradle --daemon build $GRADLE_FLAGS
        fi
    else
        # maven
        if [ "$COMPILE_ONLY" -eq 0 ]; then
            echo "INFO :: Building nanos..."
            ./gen.sh tools/classes.js generatedJava

            echo "INFO :: Packaging js..."
            ./tools/js_build/build.js
        fi

        if [[ ! -z "$VERSION" ]]; then
            mvn versions:set -DnewVersion=$VERSION
        fi

        mvn package
    fi

    if [ "${RUN_JAR}" -eq 1 ] || [ "$TEST" -eq 1 ]; then
        cp -r deploy/bin/* "${NANOPAY_HOME}/bin/"
        cp -r deploy/etc/* "${NANOPAY_HOME}/etc/"
        cp -r target/lib/* "${NANOPAY_HOME}/lib/"
        # export RES_JAR_HOME="$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')"
    fi
}

function package_tar {
    gradle --daemon tarz $GRADLE_FLAGS
}

function delete_runtime_journals {
  if [[ $DELETE_RUNTIME_JOURNALS -eq 1 && IS_AWS -eq 0 ]]; then
    echo "INFO :: Runtime journals deleted."
    rm -rf "$JOURNAL_HOME"
    mkdir -p "$JOURNAL_HOME"
  fi
}

function delete_runtime_logs {
  if [[ $DELETE_RUNTIME_LOGS -eq 1 && IS_AWS -eq 0 ]]; then
    echo "INFO :: Runtime logs deleted."
    rm -rf "$LOG_HOME"
    mkdir -p "$LOG_HOME"
  fi
}

function stop_nanos {
    echo "INFO :: Stopping nanos..."

    # TODO: with instances there may be more than one.
    # development
    RUNNING_PID=$(ps -ef | grep -v grep | grep "java.*-DNANOPAY_HOME" | awk '{print $2}')
    if [ -z "$RUNNING_PID" ]; then
        # production
        RUNNING_PID=$(ps -ef | grep -v grep | grep "java -server -jar /opt/nanopay/lib/nanopay" | awk '{print $2}')
    fi
    if [ -f "$NANOS_PIDFILE" ]; then
        PID=$(cat "$NANOS_PIDFILE")
        if [[ "$PID" != "$RUNNING_PID" ]] && [ "$STOP_ONLY" -eq 1 ]; then
            PID=$RUNNING_PID
        fi
    fi

    if [ -z "$PID" ]; then
        echo "INFO :: PID and/or file $NANOS_PIDFILE not found, nothing to stop?"
    else
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
    fi
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
    if [ "${RUN_JAR}" -eq 1 ]; then
        OPT_ARGS=
        
        if [ $GRADLE_BUILD -eq 1 ]; then
            OPT_ARGS="${OPTARGS} -V$(gradle -q --daemon getVersion)"
        fi

        if [ ! -z ${RUN_USER} ]; then
            OPT_ARGS="${OPT_ARGS} -U${RUN_USER}"
        fi

        ${NANOPAY_HOME}/bin/run.sh -Z${DAEMONIZE} -D${DEBUG} -N${NANOPAY_HOME} -W${WEB_PORT} ${OPT_ARGS}
    else
        cd "$PROJECT_HOME"

        JAVA_OPTS="-Dhostname=${HOST_NAME} ${JAVA_OPTS}"
        if [ "$DEBUG" -eq 1 ]; then
            JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=${DEBUG_SUSPEND},address=${DEBUG_PORT} ${JAVA_OPTS}"
        fi
        if [ ! -z "$WEB_PORT" ]; then
            JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=$WEB_PORT"
        fi

        # New versions of FOAM require the new nanos.webroot property to be explicitly set to figure out Jetty's resource-base.
        # To maintain the expected familiar behaviour of using the root-dir of the NP proj as the webroot we set the property
        # to be the same as the $PWD -- which at this point is the $PROJECT_HOME
        JAVA_OPTS="-Dnanos.webroot=${PWD} ${JAVA_OPTS}"

        CLASSPATH=$(JARS=("target/lib"/*.jar); IFS=:; echo "${JARS[*]}")
        CLASSPATH="build/classes/java/main:$CLASSPATH"

        MESSAGE="Starting nanos ${INSTANCE}"
        if [ "$TEST" -eq 1 ]; then
            MESSAGE="Running tests..."
            # Replacing spaces with commas.
            TESTS=${TESTS// /,}
            JAVA_OPTS="${JAVA_OPTS} -Dfoam.main=testRunnerScript"
            if [ ! -z "${TESTS}" ]; then
                JAVA_OPTS="${JAVA_OPTS} -Dfoam.tests=${TESTS}"
            fi
        fi

        export JAVA_TOOL_OPTIONS="$JAVA_OPTS"
        echo "INFO :: ${MESSAGE}..."

        if [ "$TEST" -eq 1 ]; then
            JAVA_OPTS="${JAVA_OPTS} -Dresource.journals.dir=journals"
            JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')
            exec java -jar "${JAR}"
        elif [ "$DAEMONIZE" -eq 0 ]; then
            exec java -cp "$CLASSPATH" foam.nanos.boot.Boot
        else
            nohup java -cp "$CLASSPATH" foam.nanos.boot.Boot &> /dev/null &
            echo $! > "$NANOS_PIDFILE"
        fi
    fi
}

function beginswith {
    # https://stackoverflow.com/a/18558871
    case $2 in
      "$1"*)
        true
        ;;
      *)
        false
        ;;
    esac
}

function setenv {
    if [ -z "$NANOPAY_HOME" ]; then
        NANOPAY_ROOT="/opt"
        if [ "$TEST" -eq 1 ]; then
            NANOPAY_ROOT="/tmp"
        fi
        NANOPAY="nanopay"
        if [[ ! -z "$INSTANCE" ]]; then
            NANOPAY="nanopay_${INSTANCE}"
        fi
        export NANOPAY_HOME="$NANOPAY_ROOT/${NANOPAY}"
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

    if [ "$TEST" -eq 1 ]; then
        rm -rf "$NANOPAY_HOME"
    fi

    if [ ! -d "$NANOPAY_HOME" ]; then
        mkdir -p "$NANOPAY_HOME"
    fi
    if [ ! -d "${NANOPAY_HOME}/lib" ]; then
        mkdir -p "${NANOPAY_HOME}/lib"
    fi
    if [ ! -d "${NANOPAY_HOME}/bin" ]; then
        mkdir -p "${NANOPAY_HOME}/bin"
    fi
    if [ ! -d "${NANOPAY_HOME}/etc" ]; then
        mkdir -p "${NANOPAY_HOME}/etc"
    fi
    if [ ! -d "${NANOPAY_HOME}/keys" ]; then
        mkdir -p "${NANOPAY_HOME}/keys"
    fi
    if [ ! -d "${LOG_HOME}" ]; then
        mkdir -p "${LOG_HOME}"
    fi
    if [ ! -d "${JOURNAL_HOME}" ]; then
        mkdir -p "${JOURNAL_HOME}"
    fi

    if [[ ! -w $NANOPAY_HOME && $TEST -ne 1 ]]; then
        echo "ERROR :: $NANOPAY_HOME is not writable! Please run 'sudo chown -R $USER /opt' first."
        quit 1
    fi

    PID_FILE="nanos.pid"
    if [[ ! -z "$INSTANCE" ]]; then
        PID_FILE="nanos_${INSTANCE}.pid"
    fi
    export NANOS_PIDFILE="/tmp/${PID_FILE}"

    if beginswith "/pkg/stack/stage" $0 || beginswith "/pkg/stack/stage" $PWD ; then
        PROJECT_HOME=/pkg/stack/stage/NANOPAY
        cd "$PROJECT_HOME"
        cwd=$(pwd)

        # see https://stackoverflow.com/a/22089950
        #npm install npm --ca=""
        # works with Netskope disabled.
        npm install

        CLEAN_BUILD=1
        IS_AWS=1
    fi

    JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=$NANOPAY_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=$LOG_HOME"

    # keystore
    if [ "$INSTALL" -eq 1 ] || [ "$TEST" -eq 1 ]; then
        if [[ -f $PROJECT_HOME/tools/keystore.sh ]]; then
            cd "$PROJECT_HOME"
            printf "INFO :: Generating keystore...\n"
            if [[ $TEST -eq 1 ]]; then
                ./tools/keystore.sh -t
            else
                ./tools/keystore.sh
            fi
        fi
    fi

    # HSM setup
    if [[ $IS_MAC -eq 1 ]]; then
      HSM_HOME=$PROJECT_HOME/tools/hsm
      HSM_CONFIG_PATH='/opt/nanopay/keys/pkcs11.cfg'

      #softhsm setup
      if [[ -f $HSM_HOME/development.sh ]]; then
        printf "INFO :: Setting up SoftHSM...\n"
        $HSM_HOME/development.sh -r $HSM_HOME -d $HSM_CONFIG_PATH
      fi
    fi

    if [[ -z $JAVA_HOME ]]; then
      if [[ $IS_MAC -eq 1 ]]; then
        JAVA_HOME=$($(dirname $(readlink $(which javac)))/java_home)
      elif [[ $IS_LINUX -eq 1 ]]; then
        JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
      fi
    fi

    if [ -z "$MODE" ] || [ "$MODE" == "DEVELOPMENT" ] || [ "$MODE" == "STAGING" ]; then
        JAVA_OPTS="-enableassertions ${JAVA_OPTS}"
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
    echo "  -d : Run with JDPA debugging enabled on port 8000"
    echo "  -D PORT : JDPA debugging enabled on port PORT."
    echo "  -f : Build foam."
    echo "  -g : Output running/notrunning status of daemonized nanos."
    echo "  -h : Print usage information."
    echo "  -i : Install npm and git hooks"
    echo "  -j : Delete runtime journals, build, and run app as usual."
    echo "  -J JOURNAL_CONFIG : additional journal configuration. See find.sh - deployment/CONFIG i.e. deployment/staging"
    echo "  -k : Package up a deployment tarball."
    echo "  -M MODE: one of DEVELOPMENT, PRODUCTION, STAGING, TEST, DEMO"
    echo "  -m : Run migration scripts."
    echo "  -N NAME : start another instance with given instance name. Deployed to /opt/nanopay_NAME."
    echo "  -n : new Gradle Build"
    echo "  -p : short cut for setting MODE to PRODUCTION"
    echo "  -q : short cut for setting MODE to STAGING"
    echo "  -r : Start nanos with whatever was last built."
    echo "  -s : Stop a running daemonized nanos."
    echo "  -S : When debugging, start suspended."
    echo "  -t : Run All tests."
    echo "  -T testId1,testId2,... : Run listed tests."
    echo "  -u : Run from jar. Intented for Production deployments."
    echo "  -U : User to run as"
    echo "  -v : java compile only (maven), no code generation."
    echo "  -V VERSION : Updates the project version in POM file to the given version in major.minor.path.hotfix format"
    echo "  -W PORT : HTTP Port. NOTE: WebSocketServer will use PORT+1"
    echo "  -z : Daemonize into the background, will write PID into $PIDFILE environment variable."
    echo "  -x : Check dependencies for known vulnerabilities."
    echo ""
    echo "No options implies: stop, build/compile, deploy, start"
    echo ""
}

############################

JOURNAL_CONFIG=default
INSTANCE=
HOST_NAME=`hostname -s`
GRADLE_BUILD=1
VERSION=
MODE=
#MODE=DEVELOPMENT
BUILD_ONLY=0
CLEAN_BUILD=0
DEBUG=0
DEBUG_PORT=8000
DEBUG_SUSPEND=n
export JAVA_OPTS=
INSTALL=0
PACKAGE=0
RUN_JAR=0
RUN_MIGRATION=0
RESTART_ONLY=0
TEST=0
IS_AWS=0
DAEMONIZE=0
STOP_ONLY=0
RESTART=0
STATUS=0
DELETE_RUNTIME_JOURNALS=0
DELETE_RUNTIME_LOGS=0
COMPILE_ONLY=0
WEB_PORT=8080
VULNERABILITY_CHECK=0
GRADLE_FLAGS=
LIQUID_DEMO=0
RUN_USER=

while getopts "bcdD:ghijJ:klmM:N:opqQrsStT:uUvV:W:xz" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        c) CLEAN_BUILD=1
           GRADLE_FLAGS="--rerun-tasks"
           ;;
        d) DEBUG=1 ;;
        D) DEBUG=1
           DEBUG_PORT=$OPTARG
           ;;
        g) STATUS=1 ;;
        h) usage ; quit 0 ;;
        i) INSTALL=1 ;;
        j) DELETE_RUNTIME_JOURNALS=1 ;;
        J) JOURNAL_CONFIG=$OPTARG ;;
        k) PACKAGE=1
           BUILD_ONLY=1 ;;
        l) DELETE_RUNTIME_LOGS=1 ;;
        m) RUN_MIGRATION=1 ;;
        M) MODE=$OPTARG
           echo "MODE=${MODE}"
           ;;
        N) INSTANCE=$OPTARG
           HOST_NAME=$OPTARG
           echo "INSTANCE=${INSTANCE}" ;;
        o) GRADLE_BUILD=0 ;;
        p) MODE=PRODUCTION
           echo "MODE=${MODE}"
           ;;
        q) MODE=STAGING
           CLEAN_BUILD=1
           echo "MODE=${MODE}"
           ;;
        Q) LIQUID_DEMO=1
           ;;
        r) RESTART_ONLY=1 ;;
        s) STOP_ONLY=1 ;;
        t) TEST=1
           MODE=TEST
           CLEAN_BUILD=1
           COMPILE_ONLY=0
           ;;
        T) TEST=1
           TESTS=$OPTARG
           MODE=TEST
           CLEAN_BUILD=1
           ;;
        u) RUN_JAR=1;;
        U) RUN_USER=${OPTARG};;
        v) COMPILE_ONLY=1 ;;
        V) VERSION=$OPTARG
           echo "VERSION=${VERSION}";;
        W) WEB_PORT=$OPTARG
           echo "WEB_PORT=${WEB_PORT}";;
        z) DAEMONIZE=1 ;;
        S) DEBUG_SUSPEND=y ;;
        x) VULNERABILITY_CHECK=1 ;;
        ?) usage ; quit 1 ;;
    esac
done

if [ ${GRADLE_BUILD} -eq 0 ]; then
    echo "WARNING :: Maven build is deprecated, switch to gradle by dropping 'n' flag"
fi

if [[ $RUN_JAR == 1 && $JOURNAL_CONFIG != development && $JOURNAL_CONFIG != staging && $JOURNAL_CONFIG != production ]]; then
    echo "WARNING :: ${JOURNAL_CONFIG} journal config unsupported for jar deployment";
fi

setenv

if [[ $INSTALL -eq 1 ]]; then
    install
    quit 0
fi

if [[ $VULNERABILITY_CHECK -eq 1 ]]; then
    echo "INFO :: Checking dependencies for vulnerabilities..."
    if [[ ! -f ~/.m2/repository/com/redhat/victims/maven/security-versions/1.0.6/security-versions-1.0.6.jar ]]; then
        mvn dependency:get -DgroupId=com.redhat.victims.maven -DartifactId=security-versions -Dversion=1.0.6
    fi
    mvn com.redhat.victims.maven:security-versions:check
    quit 0
fi

clean
if [ "$STATUS" -eq 1 ]; then
    status_nanos
    quit 0
fi

if [ "$RUN_MIGRATION" -eq 1 ]; then
    migrate_journals
    quit 0
fi

stop_nanos
if [ "$STOP_ONLY" -eq 1 ]; then
    quit 0
fi

deploy_journals

if [ "${RESTART_ONLY}" -eq 0 ]; then
    build_jar
fi

if [ "${PACKAGE}" -eq 1 ]; then
    package_tar
fi

if [ "${BUILD_ONLY}" -eq 0 ]; then
   start_nanos
fi

quit 0
