#!/bin/bash
# Super simple launcher.

# Run as ubuntu on staging and production
#target_user="ubuntu"
#if [ "$(uname -s)" == "Linux" ] && [ "$(whoami)" != "$target_user" ]; then
#  exec sudo -u "$target_user" -- "$0" "$@"
#fi

HOST_NAME=`hostname -s`
NANOPAY_HOME=/opt/nanopay
WEB_PORT=8080
NANOS_PIDFILE=/tmp/nanos.pid
DAEMONIZE=1
VERSION=
RUN_USER=

export DEBUG=0

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -D 0 or 1           : Debug mode."
    echo "  -h                  : Display help."
    echo "  -N <nanopay_home>   : Nanopay home directory."
    echo "  -U <user>           : User to run script as"
    echo "  -V <version>        : Version."
    echo "  -W <web_port>       : HTTP Port."
    echo "  -Z 0 or 1           : Daemonize."
}

while getopts "D:h:N:U:V:W:Z:" opt ; do
    case $opt in
        D) DEBUG=$OPTARG;;
        h) usage; exit 0;;
        N) NANOPAY_HOME=$OPTARG;;
        U) RUN_USER=$OPTARG;;
        V) VERSION=$OPTARG;;
        W) WEB_PORT=$OPTARG;;
        Z) DAEMONIZE=$OPTARG;;
        ?) usage ; exit 0 ;;
   esac
done

if [ ! -z ${RUN_USER} ] && [ "$(uname -s)" == "Linux" ] && [ "$(whoami)" != "${RUN_USER}" ]; then
    exec sudo -u "${RUN_USER}" -- "$0" "$@"
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

if [ -f "${NANOPAY_HOME}/conf/shrc.custom" ]; then
    . "${NANOPAY_HOME}/conf/shrc.custom"
fi

if [ ! -z $VERSION ]; then
    JAR="${NANOPAY_HOME}/lib/nanopay-${VERSION}.jar"
else
    JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')
fi
# export RES_JAR_HOME="${JAR}"

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"

#java -server -jar "${JAR}"
if [ "$DAEMONIZE" -eq 1 ]; then
    nohup java -server -jar "${JAR}" > ${NANOPAY_HOME}/logs/out.txt 2>&1 &
    echo $! > "${NANOS_PIDFILE}"
else
    java -server -jar "${JAR}"
fi

exit 0
