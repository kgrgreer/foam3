#!/bin/bash

REMOTE_USER=
REMOTE_URL=
SSH_KEY=
RC_FILE=~/.config/nanopay/remoterc

DEBUG=0
DAEMONIZE=0
NANOPAY_HOME=/opt/nanopay
NANOPAY_MNT=/mnt/nanopay
RUN_SCRIPT=${NANOPAY_HOME}/bin/run.sh
PORT=8080

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -C <filepath>       : remoterc file to load, default to ./config/nanopay/remoterc"
    echo "  -h                  : Print usage information."
    echo "  -I <ssh-key>        : SSH Key to use to connect to remote server"
    echo "  -U <user>           : Remote user to connect to"
    echo "  -W <web-address>    : Remote url to connect to"
    echo "  -Z <0 or 1>         : Daemonize process"
    echo ""
}
 
while getopts "C:hI:U:W:Z:" opt ; do
    case $opt in
        C) RC_FILE=$OPTARG;;
        h) usage; exit 0;;
        I) SSH_KEY=${OPTARG};;
        U) REMOTE_USER=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
        Z) DAEMONIZE=$OPTARG;;
        ?) usage; exit 0;;
   esac
done

if [ -f $RC_FILE ]; then
    echo "INFO :: Loading $RC_FILE"
    . $RC_FILE
fi

REMOTE=${REMOTE_URL}
if [ ! -z ${REMOTE_USER} ]; then
    REMOTE=${REMOTE_USER}@${REMOTE_URL}
fi

echo "INFO :: Running '${RUN_SCRIPT} -D${DEBUG} -Z${DAEMONIZE} -W${PORT} -N${NANOPAY_HOME}' on ${REMOTE}"

if [ ! -z ${SSH_KEY} ]; then
    REMOTE="-i ${SSH_KEY} ${REMOTE}"
fi

ssh -t ${REMOTE} "${RUN_SCRIPT} -D${DEBUG} -Z${DAEMONIZE} -W${PORT} -M${NANOPAY_MNT} -N${NANOPAY_HOME}"
