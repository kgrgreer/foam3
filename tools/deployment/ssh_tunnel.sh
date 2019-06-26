#!/bin/bash

MODE=
SOCKET_FILE=./ssh/sockets/nanopay
RC_FILE=./tools/deployment/remoterc

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -e                  : Exit ssh tunnel"
    echo "  -h                  : Print usage information."
    echo "  -i                  : Test if ssh tunnel is connected"
    echo "  -R <filepath>       : remoterc file to load, default to ./tools/deployment/remote"
    echo "  -s                  : Start ssh tunnel"
    echo "  -S <filepath>       : socket file location to use, default to ./tools/deployment/socket"
    echo ""
}

while getopts "ehiR:sS:" opt ; do
    case $opt in
        e) MODE=1;;
        h) usage; exit 0;;
        i) MODE=2;;
        R) RC_FILE=$OPTARG;;
        s) MODE=0;;
        S) SOCKET_FILE=$OPTARG;;
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
    ssh -f -N -M -S $SOCKET_FILE -L ${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_URL} -i ${SSH_KEY} > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "INFO :: Connection started"
    else
        echo "ERROR :: Error occured attempting to start connection"
        exit 1
    fi
else
    echo "INFO :: Exiting ssh tunnel "
    if [ ! -S $SOCKET_FILE ]; then
        echo "ERROR :: ${SOCKET_FILE} doesn't exist, can't close connection"
        exit 1
    fi
    ssh -S $SOCKET_FILE -O exit ${REMOTE_USER}@${REMOTE_URL} > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "INFO :: Connection exited"
    else
        echo "ERROR :: Error occured attempting to close connection"
        exit 1
    fi
fi

exit 0
