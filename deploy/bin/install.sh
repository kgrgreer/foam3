#!/bin/bash

NANOPAY_HOME=

function quit {
    echo "ERROR :: Install Failed"
    exit $1
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -h : Print usage information."
    echo "  -N <nanopay_home>   : Nanopay home directory."
    echo ""
}

while getopts "hN:" opt ; do
    case $opt in
        N) NANOPAY_HOME=$OPTARG;;
        h) usage; exit 0;;
        ?) usage; exit 0;;
   esac
done

NANOPAY_HOME_PARENT = $(realpath $(dirname ${NANOPAY_HOME}))

if [ -z "$NANOPAY_HOME" ]; then
    NANOPAY_HOME="/opt/nanopay"
fi

if [ ! -d $NANOPAY_HOME ]; then
    if [ ! -w ${NANOPAY_HOME_PARENT} ]; then
        echo "ERROR :: Can't write to ${NANOPAY_HOME_PARENT}"
        quit 1;
    fi
    mkdir -p ${NANOPAY_HOME}
fi

if [ ! -w $NANOPAY_HOME ]; then
    echo "ERROR :: Can't write to $(realpath ${NANOPAY_HOME})";
    quit 1;
fi

if [ ! -d ${NANOPAY_HOME}/lib ]; then
    mkdir -p ${NANOPAY_HOME}/lib
fi

cp -r ../lib/* ${NANOPAY_HOME}/lib

if [ ! -d ${NANOPAY_HOME}/bin ]; then
    mkdir -p ${NANOPAY_HOME}/bin
fi

cp -r ../bin/* ${NANOPAY_HOME}/bin

if [ ! -d ${NANOPAY_HOME}/etc ]; then
    mkdir -p ${NANOPAY_HOME}/etc
fi

cp -r ../etc/* ${NANOPAY_HOME}/etc