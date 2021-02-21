#!/bin/bash

NANOPAY_HOME=
NANOPAY_ROOT=/opt/nanopay
NANOPAY_TARBALL=
NANOPAY_REMOTE_OUTPUT=/tmp/tar_extract
NANOPAY_SERVICE_FILE=/lib/systemd/system/nanopay.service
BACKUP=true
MNT_HOME=/mnt/nanopay
SHARED_HOME=${MNT_HOME}
UNIQUE_HOME=${MNT_HOME}/$HOSTNAME
FILES_HOME=${MNT_HOME}/files
LOG_HOME=${UNIQUE_HOME}/logs
JOURNAL_HOME=${UNIQUE_HOME}/journals
CONF_HOME=${UNIQUE_HOME}/conf
BACKUP_HOME=${UNIQUE_HOME}/backups
VAR_HOME=${UNIQUE_HOME}/var

function quit {
    echo "ERROR :: Remote Install Failed"
    exit 1
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -B <true | false> : disable Backup "
    echo "  -C <true | false> : Enable clustering"
    echo "  -h                  : Print usage information."
    echo "  -I <path>           : Remote location of tarball"
    echo "  -N <nanopay_home>   : Remote Nanopay home directory, can't be /opt/nanopay"
    echo "  -O <path>           : Remote directory tarball is extracted to, default to ~/tar_extract"
    echo ""
}

while getopts "B:C:hN:O:I:" opt ; do
    case $opt in
        B) BACKUP=${OPTARG};;
        C) CLUSTER=${OPTARG};;
        h) usage; exit 0;;
        I) NANOPAY_TARBALL=$OPTARG;;
        N) NANOPAY_HOME=$OPTARG;;
        O) NANOPAY_REMOTE_OUTPUT=$OPTARG;;
        ?) usage; exit 0;;
   esac
done

if [ -z $NANOPAY_HOME ]; then
    echo "ERROR :: NANOPAY_HOME is undefined"
    quit
fi

NANOPAY_CURRENT_VERSION=$(readlink -f ${NANOPAY_ROOT} | awk -F- '{print $NF}')
NANOPAY_NEW_VERSION=$(echo ${NANOPAY_HOME} | awk -F- '{print $NF}')

function backupFiles {
    # skip on first install
    if [ ! -d ${MNT_HOME} ]; then
        return;
    fi

    if [ ! -d ${BACKUP_HOME} ]; then
        mkdir -p ${BACKUP_HOME} 
        chgrp nanopay ${BACKUP_HOME}
        chmod 750 ${BACKUP_HOME}
    fi

    # clear and copy journals and logs
    # tar'ing the live directories will fail with changed files.
    rm -rf ${BACKUP_HOME}/journals
    rm -rf ${BACKUP_HOME}/logs
    if [ -d ${JOURNAL_HOME} ]; then
        cp -r ${JOURNAL_HOME} ${BACKUP_HOME}/
    fi
    if [ -d ${LOG_HOME} ]; then
        cp -r ${LOG_HOME} ${BACKUP_HOME}/
    fi
    
    # Move same/duplicate version installation.
    if [ -d $NANOPAY_HOME ]; then
        NANOPAY_BACKUP=${BACKUP_HOME}/$(basename ${NANOPAY_HOME})-$(date +%s)-backup.tar.gz
        echo "INFO :: ${NANOPAY_HOME} found, backing up to ${NANOPAY_BACKUP}"
        if [ -d ${BACKUP_HOME}/journals ]; then
            tar -czf  ${NANOPAY_BACKUP} -C ${NANOPAY_HOME} . ${BACKUP_HOME}/journals ${BACKUP_HOME}/logs
        fi
        
        if [ ! $? -eq 0 ]; then
            echo "ERROR :: Couldn't backup ${NANOPAY_HOME} to ${NANOPAY_BACKUP}"
            quit
        fi
        if [ -d ${NANOPAY_BACKUP} ]; then
            chgrp nanopay ${NANOPAY_BACKUP}
            chmod 750 ${NANOPAY_BACKUP}
            rm -rf ${NANOPAY_HOME}
        fi
    fi
}

function installFiles {
    echo "INFO :: Installing nanopay to ${NANOPAY_HOME}"

    if [ ! -d $NANOPAY_HOME ]; then
        mkdir -p ${NANOPAY_HOME}
    fi
    chown nanopay:nanopay $NANOPAY_HOME

    if [ ! -d ${NANOPAY_HOME}/lib ]; then
        mkdir -p ${NANOPAY_HOME}/lib
    fi
    chown nanopay:nanopay ${NANOPAY_HOME}/lib
    chmod 750 ${NANOPAY_HOME}/lib

    cp -r ${NANOPAY_REMOTE_OUTPUT}/lib/* ${NANOPAY_HOME}/lib

    if [ ! -d ${NANOPAY_HOME}/bin ]; then
        mkdir -p ${NANOPAY_HOME}/bin
    fi
    chown nanopay:nanopay ${NANOPAY_HOME}/bin
    chmod 750 ${NANOPAY_HOME}/bin

    cp -r ${NANOPAY_REMOTE_OUTPUT}/bin/* ${NANOPAY_HOME}/bin

    if [ ! -d ${NANOPAY_HOME}/etc ]; then
        mkdir -p ${NANOPAY_HOME}/etc
    fi
    cp -r ${NANOPAY_REMOTE_OUTPUT}/etc/* ${NANOPAY_HOME}/etc
    chown nanopay:nanopay ${NANOPAY_HOME}/etc
    chmod -R 750 ${NANOPAY_HOME}/etc

    if [ -f ${NANOPAY_HOME}/etc/shrc.local ]; then
        chown nanopay:nanopay ${NANOPAY_HOME}/etc/shrc.local
    fi

    if [ ! -d ${MNT_HOME} ]; then
        mkdir -p ${MNT_HOME}
    fi
    chown nanopay:nanopay ${MNT_HOME}
    chmod 750 ${MNT_HOME}

    if [ ! -d ${CONF_HOME} ]; then
        mkdir -p ${CONF_HOME}
    fi
    
    if [ ! -f "${CONF_HOME}/shrc.custom" ]; then
        echo '#!/bin/bash' > ${CONF_HOME}/shrc.custom
        echo '  JAVA_OPTS="${JAVA_OPTS} -Xmx4096m"' >> ${CONF_HOME}/shrc.custom
        if [[ ${CLUSTER} = "true" ]]; then
            echo '  JAVA_OPTS="${JAVA_OPTS} -DCLUSTER=true"' >> ${CONF_HOME}/shrc.custom
        fi
    fi
    chown -R nanopay:nanopay ${CONF_HOME}
    chmod -R 750 ${CONF_HOME}

    if [ ! -d ${LOG_HOME} ]; then
        mkdir -p ${LOG_HOME}
    fi
    chown nanopay:nanopay ${LOG_HOME}
    chmod 750 ${LOG_HOME}

    if [ ! -d ${VAR_HOME} ]; then
        mkdir -p ${VAR_HOME}
    fi
    chown nanopay:nanopay ${VAR_HOME}
    chmod 750 ${VAR_HOME}

    if [ ! -d ${JOURNAL_HOME} ]; then
        mkdir ${JOURNAL_HOME}
    fi

    chown -R nanopay:nanopay ${JOURNAL_HOME}
    chmod 750 ${JOURNAL_HOME}
 #   chmod -R 640 ${JOURNAL_HOME}/*

    if [ ! -d ${FILES_HOME} ]; then
        mkdir -p ${FILES_HOME}
    fi
    chown -R nanopay:nanopay ${FILES_HOME}
    chmod 750 ${FILES_HOME}
}

function setupUser {
    echo "INFO :: Setting file permissions"

    id -u nanopay > /dev/null
    if [ ! $? -eq 0 ]; then
        echo "INFO :: User nanopay not found, creating user nanopay"
        groupadd --force --gid 6266 nanopay
        useradd -g nanopay --uid 6266 -m -s /bin/false nanopay
        usermod -L nanopay
    fi

    # test and set umask
    USER_HOME="$(grep nanopay /etc/passwd | cut -d':' -f6)"
    BASHRC="$USER_HOME/.bashrc"
    if [ ! -f "$BASHRC" ]; then
        touch "$BASHRC"
    fi
    if grep -Fxq "umask" "$BASHRC"; then
        sed -i 's/umask.*/umask 027/' "$BASHRC"
    else
       echo "umask 027" >> "$BASHRC"
    fi

    # Setup ubuntu user
    if id "ubuntu" > /dev/null 2>&1 && ! id -nG "ubuntu" | grep -qw "nanopay"; then
        sudo usermod -a -G nanopay ubuntu
    fi
}

function setupNanopaySymLink {
    if [ -h ${NANOPAY_ROOT} ]; then
        unlink ${NANOPAY_ROOT}
    elif [ -d ${NANOPAY_ROOT} ]; then
        BACKUP_DIR="${NANOPAY_ROOT}.$(date +%s).bak"
        echo "INFO :: Found old ${NANOPAY_ROOT} dir, moving to ${BACKUP_DIR}"
        mv ${NANOPAY_ROOT} ${BACKUP_DIR}
    fi

    ln -s ${NANOPAY_HOME} ${NANOPAY_ROOT}

    if [ -h ${NANOPAY_HOME}/journals ]; then
        unlink ${NANOPAY_HOME}/journals
    fi

    if [ -d ${JOURNAL_HOME} ]; then
        ln -s ${JOURNAL_HOME} ${NANOPAY_HOME}/journals
    fi

    if [ -h ${NANOPAY_HOME}/logs ]; then
        unlink ${NANOPAY_HOME}/logs
    fi

    if [ -d ${LOG_HOME} ]; then
        ln -s ${LOG_HOME} ${NANOPAY_HOME}/logs
    fi

    if [ -h ${NANOPAY_HOME}/conf ]; then
        unlink ${NANOPAY_HOME}/conf
    fi

    if [ -d ${CONF_HOME} ]; then
        ln -s ${CONF_HOME} ${NANOPAY_HOME}/conf
    fi

    if [ -h ${NANOPAY_HOME}/var ]; then
        unlink ${NANOPAY_HOME}/var
    fi

    if [ -d ${VAR_HOME} ]; then
        ln -s ${VAR_HOME} ${NANOPAY_HOME}/var
    fi

    if [ -h ${JOURNAL_HOME}/largefiles ]; then
        unlink ${JOURNAL_HOME}/largefiles
    fi
    
    if [ -d ${JOURNAL_HOME} ]; then
        ln -s ${FILES_HOME} ${JOURNAL_HOME}/largefiles
    fi
}

function setupSystemd {
    systemctl list-units | grep nanopay.service &> /dev/null
    if [ $? -eq 0 ]; then
        sudo systemctl stop nanopay
        sudo systemctl disable nanopay
    fi

    if [ ! -h ${NANOPAY_SERVICE_FILE} ]; then
        sudo ln -s ${NANOPAY_ROOT}/etc/nanopay.service ${NANOPAY_SERVICE_FILE}
    fi

    sudo systemctl daemon-reload
    sudo systemctl enable nanopay
    sudo systemctl start nanopay
}

echo "INFO :: Installing nanopay on remote server"

if [ ! -f ${NANOPAY_TARBALL} ]; then
    echo "ERROR :: Tarball ${NANOPAY_TARBALL} doesn't exist on remote server"
    quit
fi

if [ -d ${NANOPAY_REMOTE_OUTPUT} ]; then
    rm -rf ${NANOPAY_REMOTE_OUTPUT}
fi

mkdir -p ${NANOPAY_REMOTE_OUTPUT}

echo "INFO :: Extracting tarball ${NANOPAY_TARBALL}"

tar -xzf ${NANOPAY_TARBALL} -C ${NANOPAY_REMOTE_OUTPUT}

if [ ! $? -eq 0 ]; then
    echo "ERROR :: Extracting tarball failed"
    quit
fi

setupUser

if [[ ${BACKUP} = 'true' ]]; then
    backupFiles
fi

installFiles

setupNanopaySymLink

setupSystemd

exit 0
