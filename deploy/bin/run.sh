#!/bin/bash
echo $0 $@
# Super simple launcher.

NANOPAY_HOME="/opt/nanopay"
WEB_PORT=8080
HOST_NAME=`hostname -s`
INSTALL=0
export DEBUG=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -D 0 or 1             : Debug mode."
    echo "  -H <host_name>      : Hostname or IP."
    echo "  -M <mode>            : Run Mode - STAGING, PRODUCTION"
    echo "  -N <nanopay_home>  : Nanopay home directory."
    echo "  -W <web_port>       : HTTP Port."
    echo "  -i                  : Install files to Nanopay home."
}

while getopts "D:H:iM:N:W:" opt ; do
    case $opt in
        D) DEBUG=$OPTARG;;
        h) usage; exit 0;;
        H) HOST_NAME=$OPTARG;;
        N) MODE=$OPTARG;;
        N) NANOPAY_HOME=$OPTARG;;
        W) WEB_PORT=$OPTARG;;
        i) INSTALL=1;;
#        ?) usage ; exit 0 ;;
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
        mkdir -p "${NANOPAY_HOME}"
    fi
    cp -r "bin" "${NANOPAY_HOME}"
    cp -r "lib" "${NANOPAY_HOME}"
    cp -r "etc" "${NANOPAY_HOME}"
fi

export MEMORY_MODEL=SMALL
case $MODE in
    'staging')   MEMORY_MODEL=MEDIUM;;
    'production') MEMORY_MODEL=LARGE;;
esac

if [ -f "$NANOPAY_HOME/etc/shrc.local" ]; then
    . "$NANOPAY_HOME/etc/shrc.local"
fi

# TODO: assertions, java_home
JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')
export RES_JAR_HOME="${JAR}"

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"
nohup java -server -jar "${JAR}" &>/dev/null &
#java -server -jar "${JAR}"

exit 0
