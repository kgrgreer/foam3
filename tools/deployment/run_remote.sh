#!/bin/bash

REMOTE_USER=
REMOTE_URL=
SSH_KEY=
RUN_SCRIPT=/opt/nanopay/bin/run.sh
RC_FILE=~/.config/nanopay/remoterc

DEBUG=0
DAEMONIZE=0
NANOPAY_HOME=/opt/nanopay
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
    echo ""
}

while getopts "C:hI:U:W:" opt ; do
    case $opt in
        C) RC_FILE=$OPTARG;;
        h) usage; exit 0;;
        I) SSH_KEY=${OPTARG};;
        U) REMOTE_USER=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
        ?) usage; exit 0;;
   esac
done

if [ -f $RC_FILE ]; then
    echo "INFO :: Loading $RC_FILE"
    . $RC_FILE
fi

echo "INFO :: Running '${RUN_SCRIPT} -D${DEBUG} -Z${DAEMONIZE} -W${PORT} -N${NANOPAY_HOME}' on ${REMOTE_USER}@${REMOTE_URL}"

ssh -t -t -i ${SSH_KEY} ${REMOTE_USER}@${REMOTE_URL} "${RUN_SCRIPT} -D${DEBUG} -Z${DAEMONIZE} -W${PORT} -N${NANOPAY_HOME}"
