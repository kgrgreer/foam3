#!/bin/bash
# Super simple launcher.

HOST_NAME=`hostname -s`
NANOPAY_HOME=/opt/nanopay
WEB_PORT=
DEBUG_PORT=8000
DEBUG_SUSPEND=n
DEBUG_DEV=0
PROFILER=0
PROFILER_PORT=8849
NANOS_PIDFILE=/tmp/nanos.pid
DAEMONIZE=1
VERSION=
RUN_USER=
FS=rw
#CLUSTER=false

MACOS='darwin*'
LINUXOS='linux-gnu'

PROFILER_AGENT_PATH=""
if [[ $OSTYPE =~ $MACOS ]]; then
    PROFILER_AGENT_PATH="/Applications/JProfiler.app/Contents/Resources/app/bin/macos/libjprofilerti.jnilib"
elif [[ $OSTYPE =~ $LINUXOS ]]; then
    PROFILER_AGENT_PATH="/opt/jprofiler11/bin/linux-x64/libjprofilerti.so"
fi


MACOS='darwin*'
LINUXOS='linux-gnu'

PROFILER_AGENT_PATH=""
if [[ $OSTYPE =~ $MACOS ]]; then
    PROFILER_AGENT_PATH="/Applications/JProfiler.app/Contents/Resources/app/bin/macos/libjprofilerti.jnilib"
elif [[ $OSTYPE =~ $LINUXOS ]]; then
    PROFILER_AGENT_PATH="/opt/jprofiler11/bin/linux-x64/libjprofilerti.so"
fi


export DEBUG=0

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -C <true>           : enable clustering"
    echo "  -D 0 or 1           : Debug mode."
    echo "  -F <rw | ro>       : File System mode"
    echo "  -H <hostname>       : hostname "
    echo "  -h                  : Display help."
    echo "  -j 0 or 1           : JProfiler enabled"
    echo "  -J PORT            : JProfiler PORT"
    echo "  -N <nanopay_home>   : Nanopay home directory."
    echo "  -P <debug port>     : Port to run debugger on."
    echo "  -S <y/n>            : Suspend on debug launch."
    echo "  -U <user>           : User to run script as"
    echo "  -V <version>        : Version."
    echo "  -W <web_port>       : HTTP Port."
    echo "  -Z <0/1>            : Daemonize."
}

while getopts "C:D:F:H:hj:J:N:P:S:U:V:W:Z:" opt ; do
    case $opt in
        C) CLUSTER=$OPTARG;;
        D) DEBUG_DEV=$OPTARG;;
        F) FS=$OPTARG;;
        H) HOST_NAME=$OPTARG;;
        h) usage; exit 0;;
        j) PROFILER=$OPTARG;;
        J) PROFILER_PORT=$OPTARG;;
        N) NANOPAY_HOME=$OPTARG;;
        P) DEBUG_PORT=$OPTARG;;
        S) DEBUG_SUSPEND=$OPTARG;;
        U) RUN_USER=$OPTARG;;
        V) VERSION=$OPTARG;;
        W) WEB_PORT=$OPTARG;;
        Z) DAEMONIZE=$OPTARG;;
        ?) usage ; exit 0 ;;
   esac
done

echo "run.sh HOST_NAME=$HOST_NAME"

if [ ! -z ${RUN_USER} ] && [ "$(uname -s)" == "Linux" ] && [ "$(whoami)" != "${RUN_USER}" ]; then
    exec sudo -u "${RUN_USER}" -- "$0" "$@"
fi

JAVA_OPTS=""
export JOURNAL_HOME="${NANOPAY_HOME}/journals"
export DOCUMENT_HOME="${NANOPAY_HOME}/documents"
export LOG_HOME="${NANOPAY_HOME}/logs"

# load instance specific deployment options
if [ -f "${NANOPAY_HOME}/etc/shrc.local" ]; then
    . "${NANOPAY_HOME}/etc/shrc.local"
fi

JAVA_OPTS="${JAVA_OPTS} -Dresource.journals.dir=journals"
JAVA_OPTS="${JAVA_OPTS} -Dhostname=${HOST_NAME}"
if [ -z "`echo "${JAVA_OPTS}" | grep "http.port"`" ] && [ ! -z ${WEB_PORT} ]; then
    JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=${WEB_PORT}"
fi
JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=${NANOPAY_HOME}"
JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=${JOURNAL_HOME}"
JAVA_OPTS="${JAVA_OPTS} -DDOCUMENT_HOME=${DOCUMENT_HOME}"
JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=${LOG_HOME}"

if [[ ${FS} = "ro" ]]; then
    JAVA_OPTS="${JAVA_OPTS} -DFS=ro"
fi

echo CLUSTER=$CLUSTER
if [[ ${JAVA_OPTS} != *"CLUSTER"* ]]; then
  if [[ ${CLUSTER} = "true" ]]; then
    JAVA_OPTS="${JAVA_OPTS} -DCLUSTER=${CLUSTER}"
  fi
fi
if [ "$PROFILER" -eq 1 ]; then
    JAVA_OPTS="${JAVA_OPTS} -agentpath:${PROFILER_AGENT_PATH}=port=$PROFILER_PORT"
elif [ "$DEBUG" -eq 1 ]; then
    JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=${DEBUG_SUSPEND},address=${DEBUG_PORT} ${JAVA_OPTS}"
fi

if [ ! -z $VERSION ]; then
    JAR="${NANOPAY_HOME}/lib/nanopay-${VERSION}.jar"
else
    JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')
fi

export RES_JAR_HOME="${JAR}"

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"
echo ${JAVA_OPTS} > ${NANOPAY_HOME}/logs/opts.txt
echo JAVA_OPTS=${JAVA_OPTS}
if [ "$DAEMONIZE" -eq 1 ]; then
    nohup java -server -jar "${JAR}" > ${NANOPAY_HOME}/logs/out.txt 3>&1 &
    echo $! > "${NANOS_PIDFILE}"
else
    java -server -jar "${JAR}"
fi

exit 0
