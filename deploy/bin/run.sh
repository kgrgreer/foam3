#!/bin/bash
# Super simple launcher.
# Run as ubuntu on staging and production
target_user="ubuntu"
if [ "$(uname -s)" == "Linux" ] && [ "$(whoami)" != "$target_user" ]; then
  exec sudo -u "$target_user" -- "$0" "$@"
fi

HOST_NAME=`hostname -s`
export DEBUG=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -D 0 or 1            : Debug mode."
    echo "  -N <nanopay_home>  : Nanopay home directory."
    echo "  -W <web_port>       : HTTP Port."
}

while getopts "D:hN:W:" opt ; do
    case $opt in
        D) DEBUG=$OPTARG;;
        h) usage; exit 0;;
        N) NANOPAY_HOME=$OPTARG;;
        W) WEB_PORT=$OPTARG;;
#        ?) usage ; exit 0 ;;
   esac
done

if [ -z "$NANOPAY_HOME" ]; then
    NANOPAY_HOME="/opt/nanopay"
fi
if [ -z "$WEB_PORT" ]; then
    WEB_PORT=8080
fi
if [ -z "${NANOS_PIDFILE}" ]; then
    NANOS_PIDFILE="/tmp/nanos.pid"
fi

JAVA_OPTS=""
JAVA_OPTS="${JAVA_OPTS} -Dresource.journals.dir=journals"
JAVA_OPTS="${JAVA_OPTS} -Dhostname=${HOST_NAME}"
JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=${WEB_PORT}"
JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=${NANOPAY_HOME}"
JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=${NANOPAY_HOME}/journals"
JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=${NANOPAY_HOME}/logs"

export MEMORY_MODEL=SMALL

# load instance specific deployment options
if [ -f "${NANOPAY_HOME}/etc/shrc.local" ]; then
    . "${NANOPAY_HOME}/etc/shrc.local"
fi

JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')
export RES_JAR_HOME="${JAR}"

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"

java -server -jar "${JAR}"
#nohup java -server -jar "${JAR}" &>/dev/null &
#echo $! > "${NANOS_PIDFILE}"

exit 0
