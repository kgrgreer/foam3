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

    cd tools
    if [[ $OSTYPE =~ $MACOS ]]; then
      ./tomcatInstall.sh
    fi
    cd ..

    set_doc_base

    if [[ $IS_MAC -eq 1 ]]; then
        mkdir -p "$NANOPAY_HOME/journals"
        mkdir -p "$NANOPAY_HOME/logs"
    fi

    # git hooks
    git config core.hooksPath .githooks
    git config submodule.recurse true
}

function set_doc_base {
    # setup docbase
    # <Host>
    #    <Context docBase="$catalina_doc_base" path="/dev" />
    # </Host>
    if [ -f "$CATALINA_HOME/conf/server.xml" ]; then
        if ! grep -q "docBase" "$CATALINA_HOME/conf/server.xml"; then
            printf "adding docBase\n"
            sed -i -e "s,</Host>,<Context docBase=\"\${catalina_doc_base}\" path=\"/dev\" />\\
        </Host>,g" "$CATALINA_HOME/conf/server.xml"
        else
            sed -i -e "s,docBase=.*path=,docBase=\"\${catalina_doc_base}\" path=,g" "$CATALINA_HOME/conf/server.xml"
        fi
    fi
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

function setup_csp_valve {
  if [[ ! -f $CATALINA_HOME/lib/CSPValve.jar ]]; then
    local JAR_TOMCAT_CATALINA="~/.m2/repository/org/apache/tomcat/tomcat-catalina/9.0.8/tomcat-catalina-9.0.8.jar"
    local JAR_JAVAX_SERVLET="~/.m2/repository/javax/servlet/javax.servlet-api/4.0.1/javax.servlet-api-4.0.1.jar"

    pushd .
    cd nanopay/src/net/nanopay/security/csp
    mkdir build

    if [[ $IS_AWS -ne 1 || $IS_MAC -ne 1 ]]; then
      # AWS servers don't have .m2 directory. Additionally, this should also run for Linux builds.
      curl -O https://search.maven.org/remotecontent?filepath=org/apache/tomcat/tomcat-catalina/9.0.8/tomcat-catalina-9.0.8.jar
      JAR_TOMCAT_CATALINA="./tomcat-catalina-9.0.8.jar"
      curl -O https://search.maven.org/remotecontent?filepath=javax/servlet/javax.servlet-api/4.0.1/javax.servlet-api-4.0.1.jar
      JAR_JAVAX_SERVLET="./javax.servlet-api-4.0.1.jar"
    fi

    javac -cp $JAR_TOMCAT_CATALINA:$JAR_JAVAX_SERVLET:$CATALINA_HOME/lib/servlet-api.jar -d ./build CSPValve.java
    cd build
    jar cvf CSPValve.jar *
    mv CSPValve.jar $CATALINA_HOME/lib
    cd ..
    rm -rf build

    if [[ ! $PROJECT_HOME == "/pkg/stack/stage/NANOPAY" || $IS_MAC -ne 1 ]]; then
      rm $JAR_JAVAX_SERVLET $JAR_TOMCAT_CATALINA
    fi

    popd
    echo "INFO :: CSP Valve setup."
  fi
  if [[ -f "$CATALINA_HOME/conf/server.xml" ]]; then
      if ! grep -q "CSPValve" "$CATALINA_HOME/conf/server.xml"; then
          sed -i -e "s,</Host>,\\
          <Valve className=\"net.nanopay.security.csp.CSPValve\" />\\
      </Host>,g" "$CATALINA_HOME/conf/server.xml"
          printf "INFO :: Added CSP Valve to server.xml\n"
      fi
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

function build_war {
    #
    # NOTE: this removes the target directory where journal preparation occurs.
    # invoke deploy_journals after build_war
    #

    if [[ $IS_AWS -ne 1 ]]; then
      # Preventing this from running on AWS
      setup_jce
    fi

    if [ "$CLEAN_BUILD" -eq 1 ]; then
      mvn clean

      cd "$PROJECT_HOME"

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
      setup_csp_valve

      if [[ $INTERNET -ne 0 ]]; then
        # Only run this if connected to the internet to prevent the build from
        # failing.
        mvn com.redhat.victims.maven:security-versions:check
      fi
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

    # If not running nanos standalone, disable built in http server.
    if [ "$RUN_NANOS" -eq 0 ]; then
        echo 'r({"class":"foam.nanos.boot.NSpec", "name":"http"})' >> "$JOURNAL_HOME/services.0"
    fi

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

function migrate_journals {
    if [ -f "tools/migrate_journals.sh" ]; then
        ./tools/migrate_journals.sh
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
    if [[ $IS_MAC -eq 1 ]]; then
        if [[ $DELETE_RUNTIME_JOURNALS -eq 1 ]]; then
            rmdir "$JOURNAL_HOME"
            mkdir -p "$JOURNAL_HOME"
        fi
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

        mkdir -p "$CATALINA_BASE/logs"
        "$CATALINA_HOME/bin/catalina.sh" $ARGS
    fi
}

function start_nanos {
    printf "starting nanos\n"

    command -v realpath >/dev/null 2>&1 || realpath() {
            [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
        }

    cd "$PROJECT_HOME"
    mvn clean
    ./find.sh "$PROJECT_HOME" "$JOURNAL_OUT"
    ./gen.sh

    mvn -f pom-standalone.xml install
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

function setup_catalina_env {
  export CATALINA_PID="/tmp/catalina_pid"
  touch "$CATALINA_PID"

  # Handle old machines which have CATALINA_HOME defined
  if [ -n "$CATALINA_HOME" ]; then
      if [[ "$CATALINA_HOME" == "/Library/Tomcat" ]]; then
          LOG_HOME="$CATALINA_HOME/logs"
      fi
  fi

  while [ -z "$CATALINA_HOME" ]; do
      #printf "Searching for catalina... "
      testcatalina /Library/Tomcat
      if [ ! -z "$CATALINA_HOME" ]; then
          # local development
          LOG_HOME="$CATALINA_HOME/logs"
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
      export CATALINA_DOC_BASE="$PROJECT_HOME"
  fi

  if [ -z "$CATALINA_OPTS" ]; then
      export CATALINA_OPTS=""
  fi
  CATALINA_OPTS="${CATALINA_OPTS} -Dcatalina_port_http=${CATALINA_PORT_HTTP}"
  CATALINA_OPTS="${CATALINA_OPTS} -Dcatalina_port_https=${CATALINA_PORT_HTTPS}"
  CATALINA_OPTS="${CATALINA_OPTS} -Dcatalina_doc_base=${CATALINA_DOC_BASE}"
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

    if [[ $RUN_NANOS -eq 0 && $TEST -eq 0 ]]; then
        setup_catalina_env
    fi

    WAR_HOME="$PROJECT_HOME"/target/root-0.0.1

    if [ -z "$JAVA_OPTS" ]; then
        export JAVA_OPTS=""
    fi
    JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=$NANOPAY_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=$LOG_HOME"

    # keystore
    if [ -f "$PROJECT_HOME/tools/keystore.sh" ] && [ ! -d "$NANOPAY_HOME/keys" ]; then
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
    echo "  -b : Generate source, compile, and deploy war and journals."
    echo "  -c : Generate source and compile. Run maven under the default-build profile."
    echo "  -d : Run with JDPA debugging enabled."
    echo "  -j : Delete runtime journals"
    echo "  -i : Install npm and tomcat libraries"
    echo "  -m : Run migration scripts"
    echo "  -n : Run nanos. URL: http://localhost:8080/service/static/nanopay/src/net/nanopay/index.html"
    echo "  -r : Just restart the existing running Tomcat."
    echo "  -s : Stop Tomcat."
    echo "  -f : Run Tomcat in foreground."
    echo "  -h : Print usage information."
    echo "  -t : Run tests."
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
RUN_MIGRATION=0
STOP_TOMCAT=0
TEST=0
IS_AWS=0

while getopts "bcdfhijmnrst" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        c) CLEAN_BUILD=1 ;;
        d) DEBUG=1 ;;
        f) FOREGROUND=1 ;;
        j) DELETE_RUNTIME_JOURNALS=1 ;;
        i) INSTALL=1 ;;
        m) RUN_MIGRATION=1 ;;
        n) RUN_NANOS=1 ;;
        r) RESTART_ONLY=1 ;;
        s) STOP_TOMCAT=1 ;;
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

if [[ $RUN_NANOS -eq 1 || $TEST -eq 1 ]]; then
    start_nanos
elif [ "$BUILD_ONLY" -eq 1 ]; then
    build_war
    deploy_journals
elif [ "$STOP_TOMCAT" -eq 1 ]; then
    shutdown_tomcat
    printf "INFO :: Tomcat stopped...\n"
elif [ "$RUN_MIGRATION" -eq 1 ]; then
    migrate_journals
else
    shutdown_tomcat
    if [ "$RESTART_ONLY" -eq 0 ]; then
        build_war
        undeploy_war
        deploy_journals
        migrate_journals
        if [ "$FOREGROUND" -eq 1 ]; then
            deploy_war
            start_tomcat
        else
            #
            # NOTE: Tomcat needs to be running to property unpack and deploy war
            # on the linux production instances. Either work on macos localhost.
            #
            deploy_journals
            start_tomcat
            deploy_war
        fi
    else
        start_tomcat
    fi
fi

# Unset error on exit
set +e

exit 0
