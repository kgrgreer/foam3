#!/bin/bash

# Super simple launcher.

NANOPAY_HOME="/opt/nanopay"
WEB_PORT=8080
HOST_NAME=`hostname -s`

while getopts "H:N:W:" opt ; do
    case $opt in
        H) HOST_NAME=$OPTARG;;
        N) NANOPAY_HOME=$OPTARG;;
        W) WEB_PORT=$OPTARG;;
   esac
done

JAVA_OPTS=""
JAVA_OPTS="${JAVA_OPTS} -Dhostname=${HOST_NAME}"
JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=${WEB_PORT}"
JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=$NANOPAY_HOME"
JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=${NANOPAY_HOME}/journals"
JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=${NANOPAY_HOME}/logs"

# TODO: assertions, java_home
JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')

export JAVA_TOOL_OPTIONS="${JAVA_OPTS}"
#nohup java -jar "${JAR}" &>/dev/null &
#java -jar ${JAR}" &>/dev/null
java -jar "${JAR}"

exit 0
