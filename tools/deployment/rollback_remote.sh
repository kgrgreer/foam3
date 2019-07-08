#!/bin/bash

RC_FILE=~/.config/nanopay/remoterc
NANOPAY_HOME=/opt/nanopay
NANOPAY_BACKUP=/mnt/nanopay/backups

REMOTE_USER=
REMOTE_URL=
SSH_KEY=

REDEPLOY_TARBALL=
LIST_AVAILABLE=0

function quit {
    echo "ERROR :: Rollback Failed"
    exit $1
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -l                  : List available rollbacks"
    echo "  -R <epoch>         : Tarball to redeploy to"
    echo "  -U <user>           : Remote user to connect to"
    echo "  -W <web-address>    : Remote url to connect to"
    echo ""
}

while getopts "lR:U:W:" opt ; do
    case $opt in
        l) LIST_AVAILABLE=1;;
        R) REDEPLOY_TARBALL=${OPTARG};;
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


if [ ${LIST_AVAILABLE} -eq 1 ]; then
    while IFS= read -r line; do
        echo -e "\t$(echo ${line} | cut -d- -f3): ${line}"
    done < <(ssh ${SSH_KEY_OPT} ${REMOTE} "ls -1 ${NANOPAY_BACKUP} | grep -e \"nanopay-.*-bak.tar.gz\"")
fi
    
if [ ! -z ${REDEPLOY_TARBALL} ]; then
    TARBALL=$(ssh ${SSH_KEY_OPT} ${REMOTE} "ls -1 ${NANOPAY_BACKUP} | grep nanopay-.*-${REDEPLOY_TARBALL}-bak.tar.gz")
    TARBALL_FILE=${NANOPAY_BACKUP}/${TARBALL}
    if ! ssh ${SSH_KEY_OPT} ${REMOTE} "test -f ${TARBALL_FILE}"; then
        echo "ERROR :: Could not find tarball ${REDEPLOY_TARBALL}"
        quit
    fi
    echo "INFO :: Rolling back to ${TARBALL_FILE}"
fi
