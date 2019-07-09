#!/bin/bash

NANOPAY_TARBALL=
NANOPAY_REMOTE_OUTPUT=/tmp
INSTALL_ONLY=0

RC_FILE=~/.config/nanopay/remoterc

REMOTE_USER=
REMOTE_URL=
SSH_KEY=

function quit {
    echo "ERROR :: Install Failed"
    exit $1
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -C <filepath>       : remoterc file to load, default to ./config/nanopay/remoterc"
    echo "  -h                  : Print usage information."
    echo "  -i                  : Install only"
    echo "  -I <ssh-key>        : SSH Key to use to connect to remote server"
    echo "  -O <path>           : Remote Location to put tarball, default to /tmp"
    echo "  -T <tarball>        : Name of tarball, looks in target/package"
    echo "  -U <user>           : Remote user to connect to"
    echo "  -W <web-address>    : Remote url to connect to"
    echo ""
}

while getopts "C:hiI:O:T:U:W:" opt ; do
    case $opt in
        C) RC_FILE=$OPTARG;;
        h) usage; exit 0;;
        i) INSTALL_ONLY=1;;
        I) SSH_KEY=${OPTARG};;
        O) NANOPAY_REMOTE_OUTPUT=${OPTARG};;
        T) NANOPAY_TARBALL_PATH=${OPTARG};;
        U) REMOTE_USER=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
        ?) usage; exit 0;;
   esac
done

if [ -f $RC_FILE ]; then
    echo "INFO :: Loading $RC_FILE"
    . $RC_FILE
fi

VERSION=$(gradle -q getVersion)

if [ -z $NANOPAY_TARBALL_PATH ]; then
    NANOPAY_TARBALL_PATH=target/package/nanopay-deploy-${VERSION}.tar.gz
fi

NANOPAY_TARBALL=$(basename $NANOPAY_TARBALL_PATH)
NANOPAY_HOME=/opt/nanopay-${VERSION}

if [ ! -f $NANOPAY_TARBALL_PATH ]; then
    echo "ERROR :: Tarball ${NANOPAY_TARBALL_PATH} doesn't exist"
    quit
fi

# user and ssh key may be specified in .ssh/config
REMOTE=${REMOTE_URL}
if [ ! -z ${REMOTE_USER} ]; then
    REMOTE=${REMOTE_USER}@${REMOTE_URL}
fi

SSH_KEY_OPT=""
if [ ! -z ${SSH_KEY} ]; then
    SSH_KEY_OPT="-i ${SSH_KEY}"
fi

if [ $INSTALL_ONLY -eq 0 ]; then
    echo "INFO :: Copying ${NANOPAY_TARBALL_PATH} to ${REMOTE}:${NANOPAY_REMOTE_OUTPUT}"
    scp ${SSH_KEY_OPT} ${NANOPAY_TARBALL_PATH} ${REMOTE}:${NANOPAY_REMOTE_OUTPUT}/${NANOPAY_TARBALL}

    if [ ! $? -eq 0 ]; then
        echo "ERROR :: Failed copying tarball to remote server"
        quit
    else
        echo "INFO :: Successfully copied tarball to remote server"
    fi
fi

ssh ${SSH_KEY_OPT} ${REMOTE} "sudo bash -s -- -I ${NANOPAY_REMOTE_OUTPUT}/${NANOPAY_TARBALL} -N ${NANOPAY_HOME}" < ./deploy/bin/install.sh

if [ ! $? -eq 0 ]; then
    quit;
else
    echo "INFO :: Remote install successful"
fi

exit 0;
