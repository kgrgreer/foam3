#!/bin/bash

RC_FILE=~/.config/nanopay/remoterc
NANOPAY_HOME=/opt/nanopay
NANOPAY_BACKUP=/opt/nanopay_backups

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
    echo "  -R <number>         : Tarball to redeploy to"
    echo "  -U <user>           : Remote user to connect to"
    echo "  -W <web-address>    : Remote url to connect to"
    echo ""
}

while getopts "l" opt ; do
    case $opt in
        l) LIST_AVAILABLE=1;;
        U) REMOTE_USER=${OPTARG};;
        W) REMOTE_URL=${OPTARG};;
        ?) usage; exit 0;;
   esac
done

REMOTE=${REMOTE_URL}
if [ ! -z ${REMOTE_USER} ]; then
    REMOTE=${REMOTE_USER}@${REMOTE_URL}
fi

SSH_KEY_OPT=""
if [ ! -z ${SSH_KEY} ]; then
    SSH_KEY_OPT="-i ${SSH_KEY}"
fi

AVAIL_TARBALLS=()
while IFS= read -r line do;
    AVAIL_TARBALLS+=( "${line}" )
done < <(ssh ${SSH_KEY_OPT} ${REMOTE} "ls -1 ${NANOPAY_BACKUP} | grep -e \"nanopay-*.bak.tar.gz\"")

if [ ${LIST_AVAILABLE} -eq 1 ]; then
    for TARBALL in ${AVAIL_TARBALLS[@]}; do
        echo "${TARBALL}"
    done
fi

# if [ ! -z ${REDEPLOY_TARBALL} ]; then

# fi
