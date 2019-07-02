#!/bin/bash

NANOPAY_HOME=
NANOPAY_ROOT=/opt/nanopay
NANOPAY_TARBALL=
NANOPAY_REMOTE_OUTPUT=/tmp/tar_extract
NANOPAY_SERVICE_FILE=/lib/systemd/system/nanopay.service

function quit {
    echo "ERROR :: Remote Install Failed"
    exit 1
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -h                  : Print usage information."
    echo "  -I <path>           : Remote location of tarball"
    echo "  -N <nanopay_home>   : Remote Nanopay home directory, can't be /opt/nanopay"
    echo "  -O <path>           : Remote directory tarball is extracted to, default to ~/tar_extract"
    echo ""
}

while getopts "hN:O:I:" opt ; do
    case $opt in
        h) usage; exit 0;;
        I) NANOPAY_TARBALL=$OPTARG;;
        N) NANOPAY_HOME=$OPTARG;;
        O) NANOPAY_REMOTE_OUTPUT=$OPTARG;;
        ?) usage; exit 0;;
   esac
done

NANOPAY_CURRENT_VERSION=$(readlink -f ${NANOPAY_ROOT} | awk -F- '{print $NF}')
NANOPAY_NEW_VERSION=$(echo ${NANOPAY_HOME} | awk -F- '{print $NF}')

function installFiles {
    if [ -z $NANOPAY_HOME ]; then
        echo "ERROR :: NANOPAY_HOME is undefined"
    fi

    if [ -d $NANOPAY_HOME ]; then
        echo "INFO :: Old ${NANOPAY_HOME} found, deleting"
        rm -rf $NANOPAY_HOME
    fi

    echo "INFO :: Installing nanopay to ${NANOPAY_HOME}"

    if [ ! -d $NANOPAY_HOME ]; then
        mkdir -p ${NANOPAY_HOME}
        chown nanopay:nanopay $NANOPAY_HOME
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
}

function setupUserAndPermissions {
    echo "INFO :: Setting file permissions"

    id -u nanopay > /dev/null
    if [ ! $? -eq 0 ]; then
        echo "INFO :: User nanopay not found, creating user nanopay"
        useradd nanopay
        usermod -s /bin/false -L nanopay
    fi

    chown -R nanopay:nanopay $NANOPAY_HOME
}

function setupNanopaySymLink {
    if [ ! -z ${NANOPAY_CURRENT_VERSION} ]; then
        if [ "${NANOPAY_CURRENT_VERSION}" = "${NANOPAY_NEW_VERSION}" ]; then
            echo "INFO :: Found v${NANOPAY_CURRENT_VERSION}, leaving installed"
            return 0
        fi
        echo "INFO :: Found v${NANOPAY_CURRENT_VERSION}, replacing with v${NANOPAY_NEW_VERSION}"
    else
        echo "INFO :: No version found, installing v${NANOPAY_NEW_VERSION}"
    fi

    if [ -h ${NANOPAY_ROOT} ]; then
        unlink ${NANOPAY_ROOT}
    fi

    ln -s ${NANOPAY_HOME} ${NANOPAY_ROOT}
}

function setupSystemd {
    systemctl list-units | grep nanopay.service > /dev/null
    if [ $? -eq 0 ]; then
        sudo systemctl stop nanopay
        sudo systemctl disable nanopay
    fi

    if [ ! -h ${NANOPAY_SERVICE_FILE} ]; then
        sudo ln -s ${NANOPAY_HOME}/etc/nanopay.service ${NANOPAY_SERVICE_FILE}
    fi

    sudo systemctl enable nanopay
    sudo systemctl start nanopay
}

echo "INFO :: Installing nanopay on remote server"

if [ ! -f ${NANOPAY_TARBALL} ]; then
    echo "ERROR :: Tarball ${NANOPAY_TARBALL} doesn't exist on remote server"
    quit 1
fi

if [ -d ${NANOPAY_REMOTE_OUTPUT} ]; then
    rm -rf ${NANOPAY_REMOTE_OUTPUT}
fi

mkdir -p ${NANOPAY_REMOTE_OUTPUT}

echo "INFO :: Extracting tarball ${NANOPAY_TARBALL}"

tar -xzf ${NANOPAY_TARBALL} -C ${NANOPAY_REMOTE_OUTPUT}

if [ ! $? -eq 0 ]; then
    echo "ERROR :: Extracting tarball failed"
    quit 1
fi

installFiles

setupUserAndPermissions

setupNanopaySymLink

setupSystemd

exit 0
