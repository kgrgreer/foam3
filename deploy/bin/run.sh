#!/bin/bash

# Super simple launcher.

NANOPAY_HOME="/opt/nanopay"
WEB_PORT=8080
HOST_NAME=`hostname -s`
INSTALL=0

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -H <host_name>      : Hostname or IP."
    echo "  -W <web_port>       : HTTP Port."
    echo "  -N <nanopay_home>   : Nanopay home directory."
    echo "  -i                  : Install files to Nanopay home."
}

while getopts "H:iN:W:" opt ; do
    case $opt in
        H) HOST_NAME=$OPTARG;;
        N) NANOPAY_HOME=$OPTARG;;
        W) WEB_PORT=$OPTARG;;
        i) INSTALL=1;;
        ?) usage ; quit 1 ;;
   esac
done

JAVA_OPTS=""
JAVA_OPTS="${JAVA_OPTS} -Dresource.journals.dir=journals"
JAVA_OPTS="${JAVA_OPTS} -Dhostname=${HOST_NAME}"
JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=${WEB_PORT}"
JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=$NANOPAY_HOME"
JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=${NANOPAY_HOME}/journals"
JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=${NANOPAY_HOME}/logs"

if [ "${INSTALL}" -eq 1 ]; then
    if [ ! -d "${NANOPAY_HOME}" ]; then
        mkdir "${NANOPAY_HOME}"
    fi
    cp -r "bin" "${NANOPAY_HOME}"
    cp -r "lib" "${NANOPAY_HOME}"
fi

# TODO: assertions, java_home
JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"
#nohup java -jar "${JAR}" &>/dev/null &
#java -jar ${JAR}" &>/dev/null
java -jar "${JAR}"

exit 0
