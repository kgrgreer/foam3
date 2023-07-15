#!/bin/bash
# Super simple launcher.

HOST_NAME=`hostname -s`
APP_NAME=foam
APP_HOME=/opt/foam
WEB_PORT=
DEBUG_PORT=*:5005
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
    PROFILER_AGENT_PATH="/opt/jprofiler12/bin/linux-x64/libjprofilerti.so"
fi


MACOS='darwin*'
LINUXOS='linux-gnu'

PROFILER_AGENT_PATH=""
if [[ $OSTYPE =~ $MACOS ]]; then
    PROFILER_AGENT_PATH="/Applications/JProfiler.app/Contents/Resources/app/bin/macos/libjprofilerti.jnilib"
elif [[ $OSTYPE =~ $LINUXOS ]]; then
    PROFILER_AGENT_PATH="/opt/jprofiler12/bin/linux-x64/libjprofilerti.so"
fi



export DEBUG=0
function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -C <true>           : enable clustering"
    echo "  -D 0 or 1           : Debug mode."
    echo "  -F <rw | ro>        : File System mode"
    echo "  -H <hostname>       : hostname "
    echo "  -h                  : Display help."
    echo "  -j 0 or 1           : JProfiler enabled"
    echo "  -J PORT             : JProfiler PORT"
    echo "  -n <app_name>       : App name."
    echo "  -N <app_home>       : App home directory."
    echo "  -P <debug port>     : Port to run debugger on."
    echo "  -S <y/n>            : Suspend on debug launch."
    echo "  -U <user>           : User to run script as"
    echo "  -V <version>        : Version."
    echo "  -W <web_port>       : HTTP Port."
    echo "  -Z <0/1>            : Daemonize."
}

while getopts "C:D:F:H:hj:J:n:N:P:S:U:V:W:Z:" opt ; do
    case $opt in
        C) CLUSTER=$OPTARG;;
        D) DEBUG_DEV=$OPTARG;;
        F) FS=$OPTARG;;
        H) HOST_NAME=$OPTARG;;
        h) usage; exit 0;;
        j) PROFILER=$OPTARG;;
        J) PROFILER_PORT=$OPTARG;;
        n) APP_NAME=$OPTARG;;
        N) APP_HOME=$OPTARG;;
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
export JOURNAL_HOME="${APP_HOME}/journals"
export DOCUMENT_HOME="${APP_HOME}/documents"
export LOG_HOME="${APP_HOME}/logs"

# load instance specific deployment options
if [ -f "${APP_HOME}/etc/shrc.local" ]; then
    . "${APP_HOME}/etc/shrc.local"
fi

JAVA_OPTS="${JAVA_OPTS} -Dresource.journals.dir=journals"
JAVA_OPTS="${JAVA_OPTS} -Dhostname=${HOST_NAME}"
if [ -z "`echo "${JAVA_OPTS}" | grep "http.port"`" ] && [ ! -z ${WEB_PORT} ]; then
    JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=${WEB_PORT}"
fi
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
fi

if [ ! -z $VERSION ]; then
    JAR="${APP_HOME}/lib/${APP_NAME}-${VERSION}.jar"
else
    JAR=$(ls ${APP_HOME}/lib/${APP_NAME}-*.jar | awk '{print $1}')
fi

export RES_JAR_HOME="${JAR}"

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"
echo ${JAVA_OPTS} > ${APP_HOME}/logs/opts.txt
echo JAVA_OPTS=${JAVA_OPTS}
if [ "$DAEMONIZE" -eq 1 ]; then
    nohup java -server -jar "${JAR}" > ${APP_HOME}/logs/out.txt 3>&1 &
    echo $! > "${NANOS_PIDFILE}"
else
    java -server -jar "${JAR}"
fi

exit 0
