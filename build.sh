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
        exit 1
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
    echo "Building nanos jar"
    cd "$PROJECT_HOME"

    if [ "$CLEAN_BUILD" -eq 1 ]; then
        if [ -d "build/" ]; then
            rm -rf build
            mkdir build
        fi
        
        mvn clean
    fi
    
    ./gen.sh
    mvn package
}

function start_nanos {
    echo "Starting nanos"
    
    cd "$PROJECT_HOME"
    ./find.sh "$PROJECT_HOME" "$JOURNAL_OUT"
    deploy_journals
    exec java $JAVA_OPTS -jar target/root-0.0.1.jar
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

function cleanup_tomcat {
  export CATALINA_PID="/tmp/catalina_pid"

  # Handle old machines which have CATALINA_HOME defined
  if [ -n "$CATALINA_HOME" ]; then
      if [[ "$CATALINA_HOME" == "/Library/Tomcat" ]]; then
          LOG_HOME="$CATALINA_HOME/logs"
      fi
  fi

  while [ -z "$CATALINA_HOME" ]; do
      testcatalina /Library/Tomcat
      if [ ! -z "$CATALINA_HOME" ]; then
          # local development
          LOG_HOME="$CATALINA_HOME/logs"
          break
      fi
      testcatalina /opt/tomcat
      if [ ! -z "$CATALINA_HOME" ]; then
          break;
      fi
      testcatalina "$HOME/tools/tomcat"
      if [ ! -z "$CATALINA_HOME" ]; then
          break
      fi
      printf "CATALINA_HOME not found.\n"
      return
  done

  "$CATALINA_HOME/bin/shutdown.sh" -force || true &>/dev/null
}

function setenv {
    if [ -z "$NANOPAY_HOME" ]; then
        export NANOPAY_HOME="/opt/nanopay"
    fi

    if [[ ! -w $NANOPAY_HOME && $TEST -ne 1 ]]; then
        echo "ERROR :: $NANOPAY_HOME is not writable! Please run 'sudo chown -R $USER /opt' first."
        set +e
        exit 1
    fi

    if [ -z "$LOG_HOME" ]; then
        LOG_HOME="$NANOPAY_HOME/logs"
    fi

    export PROJECT_HOME="$( cd "$(dirname "$0")" ; pwd -P )"

    export JOURNAL_OUT="$PROJECT_HOME"/target/journals

    export JOURNAL_HOME="$NANOPAY_HOME/journals"

    if beginswith "/pkg/stack/stage" $0 || beginswith "/pkg/stack/stage" $PWD ; then
        PROJECT_HOME=/pkg/stack/stage/NANOPAY
        cd "$PROJECT_HOME"
        cwd=$(pwd)
        npm install

        mkdir -p "$NANOPAY_HOME"

        # Production use S3 mount
        if [[ -d "/mnt/journals" ]]; then
            ln -s "$JOURNAL_HOME" "/mnt/journals"
        else
            mkdir -p "$JOURNAL_HOME"
        fi

        CLEAN_BUILD=1
        IS_AWS=1

        mkdir -p "$LOG_HOME"
    elif [[ $IS_MAC -eq 1 ]]; then
        # transition support until next build.sh -i
        if [[ ! -d "$JOURNAL_HOME" ]]; then
            JOURNAL_HOME="$PROJECT_HOME/journals"
            mkdir -p $JOURNAL_HOME
            mkdir -p $LOG_HOME
        fi
    else
        # linux
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
    if [[ -f $PROJECT_HOME/tools/keystore.sh && (! -d $NANOPAY_HOME/keys || ! -f $NANOPAY_HOME/keys/passphrase) ]]; then
        cd "$PROJECT_HOME"
        printf "INFO :: Generating keystore...\n"
        ./tools/keystore.sh
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
    echo "  -c : Clean first"
    echo "  -b : Build only"
    echo "  -s : Start only."
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -i : Install npm and git hooks"
    echo "  -m : Run migration scripts"
    echo "  -h : Print usage information."
    echo "  -t : Run tests."
    echo ""
    echo "No options implys -b and -s, (build and then start)."
}

############################

BUILD_ONLY=0
CLEAN_BUILD=0
DEBUG=0
INSTALL=0
RUN_MIGRATION=0
START_ONLY=0
TEST=0
IS_AWS=0

while getopts "bscdimsth" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        s) START_ONLY=1 ;;
        c) CLEAN_BUILD=1 ;;
        d) DEBUG=1 ;;
        i) INSTALL=1 ;;
        m) RUN_MIGRATION=1 ;;
        t) TEST=1 ;;
        h) usage ; exit 0 ;;
        ?) usage ; exit 1 ;;
    esac
done

setenv

if [[ $INSTALL -eq 1 ]]; then
    install
    # Unset error on exit
    set +e
    exit 0
fi

if [[ $TEST -eq 1 ]]; then
  echo "INFO :: Running all tests..."
  JAVA_OPTS="${JAVA_OPTS} -Dfoam.main=testRunnerScript"
fi

if [[ $DIST -eq 1 ]]; then
    dist
    exit 0
fi

if [ "$BUILD_ONLY" -eq 1 ]; then
    build_jar
    deploy_journals
elif [ "$RUN_MIGRATION" -eq 1 ]; then
    migrate_journals
elif [ "$START_ONLY" -eq 1 ]; then
    start_nanos
else
    # cleanup old tomcat instances
    cleanup_tomcat
    
    build_jar
    deploy_journals
    start_nanos
fi

# Unset error on exit
set +e

exit 0
