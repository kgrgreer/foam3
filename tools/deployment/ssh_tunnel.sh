#!/bin/bash

MODE=
SOCKET_FILE=~/.ssh/sockets/nanopay
RC_FILE=~/.config/nanopay/remoterc

REMOTE_USER=
REMOTE_URL=
SSH_KEY=
LOCAL_PORT=
REMOTE_PORT=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -C <filepath>       : remoterc file to load, default to ./config/nanopay/remoterc"
    echo "  -e                  : Exit ssh tunnel"
    echo "  -h                  : Print usage information."
    echo "  -i                  : Test if ssh tunnel is connected"
    echo "  -I <filepath>       : SSH Key to use"
    echo "  -L <port>           : Local port to use"
    echo "  -R <port>           : Remote port to use"
    echo "  -s                  : Start ssh tunnel"
    echo "  -S <filepath>       : socket file location to use, default to ./ssh/sockets/nanopay"
    echo "  -U <user>           : User to connect to"
    echo "  -W <url>            : Remote URL to connect to"
    echo ""
}

while getopts "ehiR:sS:" opt ; do
    case $opt in
        C) RC_FILE=$OPTARG;;
        e) MODE=1;;
        h) usage; exit 0;;
        i) MODE=2;;
        I) SSH_KEY=$OPTARG;;
        L) LOCAL_PORT=$OPTARG;;
        R) REMOTE_PORT=$OPTARG;;
        s) MODE=0;;
        S) SOCKET_FILE=$OPTARG;;
        U) REMOTE_USER=$OPTARG;;
        W) REMOTE_URL=$OPTARG;;
        ?) usage; exit 0;;
   esac
done

if [ -z $MODE ]; then
    echo "ERROR :: No mode specified"
    exit 1
fi

if [ $MODE -eq 2 ]; then
    if [ -S $SOCKET_FILE ]; then
        echo "INFO :: SSH Tunnel is connected"
        exit 0
    else
        echo "INFO :: SSH Tunnel is not connected"
        exit 1
    fi
fi

SOCKET_DIR=$(dirname $SOCKET_FILE)
if [ ! -d $SOCKET_DIR ]; then
    mkdir -p $SOCKET_DIR
fi

if [ -f $RC_FILE ]; then
    echo "INFO :: Loading $RC_FILE"
    . $RC_FILE
fi

if [ $MODE -eq 0 ]; then
    echo "INFO :: Starting ssh tunnel "
    if [ -S ${SOCKET_FILE} ]; then
        echo "ERROR :: ${SOCKET_FILE} already exists, close connection first"
        exit 1
    fi
    ssh -f -N -M -S $SOCKET_FILE -L ${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_URL} -i ${SSH_KEY} &> /dev/null
    if [ $? -eq 0 ]; then
        echo "INFO :: Connection started"
    else
        echo "ERROR :: Error occured attempting to start connection"
        exit 1
    fi
elif [ $MODE -eq 1 ]; then
    echo "INFO :: Exiting ssh tunnel "
    if [ ! -S $SOCKET_FILE ]; then
        echo "ERROR :: ${SOCKET_FILE} doesn't exist, can't close connection"
        exit 1
    fi
    ssh -S $SOCKET_FILE -O exit ${REMOTE_USER}@${REMOTE_URL} &> /dev/null
    if [ $? -eq 0 ]; then
        echo "INFO :: Connection exited"
    else
        echo "ERROR :: Error occured attempting to close connection"
        exit 1
    fi
else
    echo "ERROR :: Unknown Mode, exiting"
    exit 1
fi

exit 0
