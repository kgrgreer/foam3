#!/bin/bash

NANOPAY_HOME=/opt/nanopay
NANOPAY_TARBALL=nanopay-deploy.tar.gz
NANOPAY_REMOTE_OUTPUT=\~/
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
    echo "  -h                  : Print usage information."
    echo "  -N <nanopay_home>   : Remote Nanopay home directory, default to /opt/nanopay"
    echo "  -O <path>           : Remote Location to put tarball, default to ~/"
    echo "  -T <tarball>        : Name of tarball, looks in target/package, default to nanopay-deploy.tar.gz"
    echo "  -I <ssh-key>        : SSH Key to use to connect to remote server"
    echo "  -W <web-address>    : Web address to connect to"
    echo ""
}

while getopts "hN:T:W:O:I:" opt ; do
    case $opt in
        h) usage; exit 0;;
        N) NANOPAY_HOME=${OPTARG};;
        O) NANOPAY_REMOTE_OUTPUT=${OPTARG};;
        T) NANOPAY_TARBALL=${OPTARG};;
        I) SSH_KEY=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
        ?) usage; exit 0;;
   esac
done

NANOPAY_TARBALL_PATH="target/package/${NANOPAY_TARBALL}"

if [ ! -f $NANOPAY_TARBALL_PATH ]; then
    echo "ERROR :: Tarball ${NANOPAY_TARBALL_PATH} doesn't exist"
    quit 1
fi

echo "INFO :: Copying ${NANOPAY_TARBALL_PATH} to ${REMOTE_URL}:${NANOPAY_REMOTE_OUTPUT}"

scp -i ${SSH_KEY} ${NANOPAY_TARBALL_PATH} ${REMOTE_URL}:${NANOPAY_REMOTE_OUTPUT}/${NANOPAY_TARBALL}

if [ ! $? -eq 0 ]; then
    echo "ERROR :: Failed copying tarball to remote server"
    quit 1
else
    echo "INFO :: Successfully copied tarball to remote server"
fi

ssh -i ${SSH_KEY} ${REMOTE_URL} "bash -s" -- < ./deploy/bin/install.sh -I ${NANOPAY_REMOTE_OUTPUT}/${NANOPAY_TARBALL} -N ${NANOPAY_HOME} -O tar_extract

if [ ! $? -eq 0 ]; then
    quit 1;
else
    echo "INFO :: Remote install successful"
fi

exit 0;
