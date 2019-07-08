#!/bin/bash

REMOTE_USER=
REMOTE_URL=
SSH_KEY=
SERVICE_NAME=nanopay.service
RC_FILE=~/.config/nanopay/remoterc

NANOPAY_HOME=/opt/nanopay
NANOPAY_MNT=/mnt/nanopay
RUN_SCRIPT=${NANOPAY_HOME}/bin/run.sh
ENABLE=0
START=0
STATUS=0
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
    echo "  -s                  : Status"
    echo "  -S <1 or 2>         : Start (1) or Stop (2) nanopay"
    echo "  -E <1 or 2>         : Enable (1) or Disable (2) nanopay"
    echo ""
}
 
while getopts "C:E:hI:sS:U:W:" opt ; do
    case $opt in
        C) RC_FILE=$OPTARG;;
        E) ENABLE=${OPTARG};;
        h) usage; exit 0;;
        I) SSH_KEY=${OPTARG};;
        s) STATUS=1;;
        S) START=${OPTARG};;
        U) REMOTE_USER=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
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

SSH_KEY_OPT=""
if [ ! -z ${SSH_KEY} ]; then
    SSH_KEY_OPT="-i ${SSH_KEY}"
fi

if [ ${STATUS} -eq 1 ]; then
    ssh -t ${SSH_KEY_OPT} ${REMOTE} "systemctl status ${SERVICE_NAME}"
fi

case ${ENABLE} in
    1)  ssh -t ${SSH_KEY_OPT} ${REMOTE} "sudo systemctl enable ${SERVICE_NAME}"
        echo "INFO :: Enabled ${SERVICE_NAME} on ${REMOTE}"
        ;;
    2)  ssh -t ${SSH_KEY_OPT} ${REMOTE} "sudo systemctl disable ${SERVICE_NAME}"
        echo "INFO :: Disabled ${SERVICE_NAME} on ${REMOTE}"
        ;;
esac

case ${START} in
    1)  ssh -t ${SSH_KEY_OPT} ${REMOTE} "sudo systemctl start ${SERVICE_NAME}"
        echo "INFO :: Started ${SERVICE_NAME} on ${REMOTE}"
        ;;
    2)  ssh -t ${SSH_KEY_OPT} ${REMOTE} "sudo systemctl stop ${SERVICE_NAME}"
        echo "INFO :: Stopped ${SERVICE_NAME} on ${REMOTE}"
        ;;
esac
