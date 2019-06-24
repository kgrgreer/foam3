#!/bin/bash

NANOPAY_HOME=/opt/nanopay
NANOPAY_TARBALL=\~/nanopay-deploy.tar.gz
NANOPAY_REMOTE_OUTPUT=\~/tar_extract

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
    echo "  -I <path>           : Remote location of tarball, default to ~/nanopay/nanopay-deploy.tar.gz"
    echo "  -O <path>           : Remote directory tarball is extracted to, default to ~/tar_extract"
    echo ""
}

while getopts "hN:O:I:" opt ; do
    case $opt in
        h) usage; exit 0;;
        N) NANOPAY_HOME=$OPTARG;;
        O) NANOPAY_REMOTE_OUTPUT=$OPTARG;;
        I) NANOPAY_TARBALL=$OPTARG;;
        ?) usage; exit 0;;
   esac
done

if [ ! -f ${NANOPAY_TARBALL} ]; then
    echo "ERROR :: Tarball ${NANOPAY_TARBALL} doesn't exist on remote server"
    quit 1
fi

if [ ! -d ${NANOPAY_REMOTE_OUTPUT} ]; then
    mkdir -p ${NANOPAY_REMOTE_OUTPUT}
fi

tar -xzf ${NANOPAY_TARBALL} -C ${NANOPAY_REMOTE_OUTPUT}

exit 0

NANOPAY_HOME_PARENT = $(realpath $(dirname ${NANOPAY_HOME}))

if [ -z "$NANOPAY_HOME" ]; then
    NANOPAY_HOME="/opt/nanopay"
fi

if [ ! -d $NANOPAY_HOME ]; then
    if [ ! -w ${NANOPAY_HOME_PARENT} ]; then
        echo "ERROR :: Can't write to ${NANOPAY_HOME_PARENT}"
        quit 1
    fi
    mkdir -p ${NANOPAY_HOME}
fi

if [ ! -w $NANOPAY_HOME ]; then
    echo "ERROR :: Can't write to $(realpath ${NANOPAY_HOME})"
    quit 1
fi

if [ ! -d ${NANOPAY_HOME}/lib ]; then
    mkdir -p ${NANOPAY_HOME}/lib
fi

cp -r ${NANOPAY_REMOTE_OUTPUT}/lib/* ${NANOPAY_HOME}/lib

if [ ! -d ${NANOPAY_HOME}/bin ]; then
    mkdir -p ${NANOPAY_HOME}/bin
fi

cp -r ${NANOPAY_REMOTE_OUTPUT}/bin/* ${NANOPAY_HOME}/bin

if [ ! -d ${NANOPAY_HOME}/etc ]; then
    mkdir -p ${NANOPAY_HOME}/etc
fi

cp -r ${NANOPAY_REMOTE_OUTPUT}/etc/* ${NANOPAY_HOME}/etc