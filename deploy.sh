#!/bin/bash
# Deploy nanopay application to linux servers.

# Exit on first failure
set -e

function setup_ssh_key {
  local PUBKEY=$(cat ~/.ssh/id_rsa.pub)

  if ssh $HOST "[[ ! -d ~/.ssh ]]"; then
    ssh $HOST "mkdir ~/.ssh"
  fi

  if ssh $HOST "[[ -f ~/.ssh/authorized_keys ]]" && ssh $HOST "grep -Fxq \"$PUBKEY\" ~/.ssh/authorized_keys"; then
    echo "INFO :: Public key exists in Host's authorized_keys."
  else
    echo $PUBKEY | ssh $HOST "cat >> ~/.ssh/authorized_keys"
    echo "INFO :: Appended public key (id_rsa.pub) into Host's authorized_keys."
  fi
}

function setup_ssh {
  local SETUP_SSH=0

  # Check for SSH Directory
  if [[ ! -d ~/.ssh ]]; then
    mkdir -p ~/.ssh/
    echo "INFO : mkdir : Created new .ssh directory."
    SETUP_SSH=1
  fi

  # Check for the existence of passphrase
  if [[ ! -f ~/.ssh/id_rsa.pub ]]; then
    ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
    echo "INFO : ssh-keygen : Generated new ssh key."
    setup_ssh_key
    SETUP_SSH=1
  fi

  # Check for SSH config
  if [[ ! -f ~/.ssh/config ]]; then
    touch ~/.ssh/config
    chmod 644 ~/.ssh/config
    echo "INFO : touch : Created SSH config file."
    SETUP_SSH=1
  fi

  if [[ $SETUP_HOST_SSH_KEY -eq 1 ]]; then
    setup_ssh_key
    SETUP_SSH=1
  fi

  if [[ SETUP_SSH -ne 0 ]]; then
    echo "ERROR :: SSH alias is not setup in the ~/.ssh/config file. Please re-run
      this script after setup. Aborting..." >&2
    exit 1
  else
    echo "INFO :: SSH setup complete."
  fi
}

function install_tomcat {
  local INSTALL_SCRIPT="
#!/bin/bash
groupadd tomcat
useradd -M -s /bin/nologin -g tomcat -d $HOST_CATALINA_HOME tomcat
cd $HOST_TEMP
curl -o apache-tomcat-8.5.31.tar.gz http://mirror.csclub.uwaterloo.ca/apache/tomcat/tomcat-8/v8.5.31/bin/apache-tomcat-8.5.31.tar.gz
mkdir $HOST_CATALINA_HOME
tar xvf apache-tomcat-8*tar.gz -C $HOST_CATALINA_HOME --strip-components=1
cd $HOST_CATALINA_HOME
chgrp -R tomcat $HOST_CATALINA_HOME
chmod -R g+rw conf
chmod g+x conf
chmod +x bin/*.sh
rm -rf webapps
mkdir webapps/
chown -R tomcat webapps/ work/ temp/ logs/
chmod g+wr logs
"

  echo "${INSTALL_SCRIPT}" | ssh $HOST "cat > $HOST_TEMP/install_tomcat.sh"
  ssh $HOST "chmod +x $HOST_TEMP/install_tomcat.sh"
  ssh $HOST $HOST_TEMP/install_tomcat.sh

  echo "INFO :: Tomcat installation complete."
}

function deploy_journals {
  if ssh $HOST "[[ ! -d $HOST_JOURNAL_HOME ]]"; then
    ssh $HOST "mkdir $HOST_JOURNAL_HOME"
  fi

  for journal in $(ls $JOURNAL_HOME); do
    if [[ -f $JOURNAL_HOME/$journal ]]; then
      scp $JOURNAL_HOME/$journal $HOST:$HOST_JOURNAL_HOME
    else
      echo "INFO : Journal Deployment : $journal is not a regular file; hence skipping for deployment."
    fi
  done

  ssh $HOST "chgrp -R tomcat $HOST_JOURNAL_HOME"
  ssh $HOST "chmod -R g+rw $HOST_JOURNAL_HOME"

  echo "INFO :: Journals deployed."
}

function setup_tomcat_service {
  local SERVICE_SCRIPT="
#!/bin/bash
#
# tomcat8
#
# chkconfig: - 80 20
#
### BEGIN INIT INFO
# Provides: tomcat8
# Required-Start: \$network \$syslog
# Required-Stop: \$network \$syslog
# Default-Start:
# Default-Stop:
# Description: Tomcat 8
# Short-Description: start and stop tomcat
### END INIT INFO

## Source function library.
#. /etc/rc.d/init.d/functions
export JAVA_HOME=\"$HOST_JAVA_HOME\"
export JAVA_OPTS=\"$HOST_JAVA_OPTS\"
export CATALINA_OPTS=\"$HOST_CATALINA_OPTS\"
TOMCAT_HOME=\"$HOST_CATALINA_HOME\"
TOMCAT_USER=\"tomcat\"
SHUTDOWN_WAIT=20

tomcat_pid() {
  echo \$(ps aux | grep org.apache.catalina.startup.Bootstrap | grep -v grep | awk '{ print \$2 }')
}

start() {
  pid=\$(tomcat_pid)
  if [ -n \"\$pid\" ]
  then
    echo \"Tomcat is already running (pid: \$pid)\"
  else
    # Start tomcat
    echo \"Starting tomcat\"
    ulimit -n 100000
    umask 007
    /bin/su -p -s /bin/sh \$TOMCAT_USER \"\$TOMCAT_HOME/bin/startup.sh\"
  fi

  return 0
}

stop() {
  pid=\$(tomcat_pid)
  if [ -n \"\$pid\" ]
  then
    echo \"Stoping Tomcat\"
    /bin/su -p -s /bin/sh \$TOMCAT_USER \$TOMCAT_HOME/bin/shutdown.sh

    let kwait=\$SHUTDOWN_WAIT
    count=0;
    until [ \$(ps -p \$pid | grep -c \$pid) = '0' ] || [ \$count -gt \$kwait ]
    do
      echo -n -e \"\\nWaiting for processes to exit\";
      sleep 1
      let count=\$count+1;
    done

    if [ \$count -gt \$kwait ]; then
      echo -n -e \"\\nkilling processes which didn't stop after \$SHUTDOWN_WAIT seconds\"
      kill -9 \$pid
    fi
  else
    echo \"Tomcat is not running\"
  fi

  return 0
}

case \$1 in
  start) start ;;
  stop) stop ;;
  restart)
    stop
    start
  ;;
  status)
    pid=\$(tomcat_pid)
    if [ -n \"\$pid\" ]
    then
      echo \"Tomcat is running with pid: \$pid\"
    else
      echo \"Tomcat is not running\"
    fi
  ;;
esac
exit 0
"

  echo "${SERVICE_SCRIPT}" | ssh $HOST "cat > /etc/init.d/tomcat"
  ssh $HOST "chmod +x /etc/init.d/tomcat"
  ssh $HOST "chkconfig tomcat on"

  echo "INFO :: Tomcat service setup complete."
}

function start_tomcat {
  if ssh $HOST "[[ -f /etc/init.d/tomcat ]]"; then
    if [[ $(ssh $HOST "service tomcat status") = *"pid"* ]]; then
        ssh $HOST "service tomcat restart"
        echo "INFO :: Tomcat restarted."
    else
      ssh $HOST "service tomcat start"
      echo "INFO :: Tomcat started."
    fi
  else
    setup_tomcat_service
    start_tomcat
  fi
}

function create_nanopay_dir {
  if ssh $HOST "[[ ! -d $NANOPAY_HOME ]]"; then
    ssh $HOST "mkdir $NANOPAY_HOME"
    ssh $HOST "chgrp tomcat $NANOPAY_HOME"
    ssh $HOST "chmod g+rw $NANOPAY_HOME"
    echo "INFO : $NANOPAY_HOME : Nanopay directory successfully created."
  else
    echo "INFO : $NANOPAY_HOME : Nanopay directory already exists."
  fi
}

function deploy_war {
    scp $WAR_HOME/../ROOT.war $HOST:$HOST_CATALINA_HOME/webapps/ROOT.war.tmp
    ssh $HOST "mv $HOST_CATALINA_HOME/webapps/ROOT.war.tmp $HOST_CATALINA_HOME/webapps/ROOT.war"
    echo "INFO :: New WAR file deployed."
}

function undeploy_war {
    if ssh $HOST "[[ -d $HOST_CATALINA_HOME/webapps/ROOT ]]"; then
        ssh $HOST "rm -r $HOST_CATALINA_HOME/webapps/ROOT"
        echo "INFO :: Old WAR file undeployed."
    fi
}

function remove {
  if ssh $HOST "[[ -f /etc/init.d/tomcat ]]"; then
    ssh $HOST "service tomcat stop"
    ssh $HOST "rm -f /etc/init.d/tomcat"
    ssh $HOST "rm -rf /opt/tomcat"
    echo "INFO : tomcat : Service stopped and uninstalled."
  fi

  if ssh $HOST "[[ -d $HOST_TEMP ]]"; then
    ssh $HOST "rm -rf $HOST_TEMP"
    echo "INFO : $HOST_TEMP : Directory removed."
  fi

  if ssh $HOST "[[ -d $HOST_JOURNAL_HOME ]]"; then
    ssh $HOST "rm -rf $HOST_JOURNAL_HOME"
    echo "INFO : $HOST_JOURNAL_HOME : Journals directory removed."
  fi

  if ssh $HOST "[[ -d $NANOPAY_HOME ]]"; then
    ssh $HOST "rm -rf $NANOPAY_HOME"
    echo "INFO : $NANOPAY_HOME : Nanopay directory removed."
  fi

  if ssh $HOST "id tomcat >/dev/null 2>&1"; then
    ssh $HOST "userdel -r tomcat"
    echo "INFO : userdel : Tomcat user removed from the Host."
  fi

  if ssh $HOST "getent group tomcat"; then
    ssh $HOST "groupdel tomcat"
    echo "INFO : groupdel : Tomcat group removed from the Host."
  fi

  ssh "yum remove -y vim-enhanced jdk1.8.x86_64"
  echo "INFO :: Removed all files and stopped services from $HOST."
}

function cleanup {
  ssh $HOST "rm -rf $HOST_TEMP"
  echo "INFO :: Removed generated temporary files."
}

function install_prereqs {
  if ssh $HOST "[[ \$UID -eq 0 ]]"; then
    if ssh $HOST "[[ ! -d $HOST_TEMP ]]"; then
      ssh $HOST "mkdir $HOST_TEMP"
    fi

    ssh $HOST "curl -v -j -k -L -H \"Cookie: oraclelicense=accept-securebackup-cookie\" $JAVA_DOWNLOAD_URL -o $HOST_TEMP/$JAVA_VERSION.rpm"
    ssh $HOST "yum install -y vim-enhanced $HOST_TEMP/$JAVA_VERSION.rpm"
    echo "INFO :: Pre-requisites installed."
  else
    echo "ERROR :: You must be root to setup the server." >&2
    exit 1
  fi
}

function test_ports {
  ssh vmware "netstat -plnt | grep $HOST_CATALINA_PORT_HTTP | grep LISTEN" | awk '{
    if ($7 ~ /java/)
      print "INFO : Port Check : App is listening on port '$HOST_CATALINA_PORT_HTTP'.";
    else
      print "WARNING : Port Check : Port '$HOST_CATALINA_PORT_HTTP' is not being bound by Tomcat. Please check.";
  } END {
    if (!NR)
      print "WARNING : Port Check : Port '$HOST_CATALINA_PORT_HTTP' is blocked. Please configure SELinux to open port.";
  }'

  ssh vmware "netstat -plnt | grep $HOST_CATALINA_PORT_HTTPS | grep LISTEN" | awk '{
    if ($7 ~ /java/)
      print "INFO : Port Check : App is listening on port '$HOST_CATALINA_PORT_HTTPS'.";
    else
      print "WARNING : Port Check : Port '$HOST_CATALINA_PORT_HTTPS' is not being bound by Tomcat. Please check.";
  } END {
    if (!NR)
      print "WARNING : Port Check : Port '$HOST_CATALINA_PORT_HTTPS' is blocked. Please configure SELinux to open port.";
  }'
}

function setenv {
  # JAVA_VERSION=jre-1.8.0-openjdk
  JAVA_VERSION=jdk-8u172-linux-x64
  JAVA_DOWNLOAD_URL=http://download.oracle.com/otn-pub/java/jdk/8u172-b11/a58eab1ec242421181065cdc37240b08/$JAVA_VERSION.rpm

  # Local paths and variables
  PROJECT_HOME="$( cd "$(dirname "$0")" ; pwd -P )"
  WAR_HOME="$PROJECT_HOME"/target/root-0.0.1
  JOURNAL_HOME="$PROJECT_HOME/journals"

  # Remote paths and variables
  NANOPAY_HOME="/usr/local/nanopay"
  HOST_TEMP="/tmp/nanopay"
  HOST_CATALINA_HOME="/opt/tomcat"
  HOST_CATALINA_BASE=$HOST_CATALINA_HOME
  HOST_CATALINA_DOC_BASE=$NANOPAY_HOME
  # HOST_JAVA_HOME="/usr/lib/jvm/$JAVA_VERSION.x86_64"
  HOST_JAVA_HOME="/usr/java/jdk1.8.0_172-amd64/jre"
  HOST_JOURNAL_HOME="/mnt/journals"

  HOST_JAVA_OPTS="-DJOURNAL_HOME=$HOST_JOURNAL_HOME"
  HOST_JAVA_OPTS="${HOST_JAVA_OPTS} -DLOG_HOME=$HOST_CATALINA_BASE/logs"

  HOST_CATALINA_PORT_HTTP=8080
  HOST_CATALINA_PORT_HTTPS=8443
  HOST_CATALINA_OPTS="-Xms1024M -Xmx1024M -server -XX:+UseParallelGC"
  HOST_CATALINA_OPTS="${HOST_CATALINA_OPTS} -Dcatalina_port_http=${HOST_CATALINA_PORT_HTTP}"
  HOST_CATALINA_OPTS="${HOST_CATALINA_OPTS} -Dcatalina_port_https=${HOST_CATALINA_PORT_HTTPS}"
  HOST_CATALINA_OPTS="${HOST_CATALINA_OPTS} -Dcatalina_doc_base=${HOST_CATALINA_DOC_BASE}"
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -h <host_ip>  : Hostname or IP."
    echo "  -u <username> : Username on the Host."
    echo "  -d            : Only update deployed app (optional)."
    echo "  -r            : Remove all files and server on the host."
    echo "  -s            : Setup SSH key on the Host."
    echo "  -t            : Test if the app is running on the server."
}

################################################################################

DEPLOY=0
REMOVE=0
SETUP_HOST_SSH_KEY=0
TEST_APP=0

while getopts ":h:u:dsrt" opt ; do
    case $opt in
        d) DEPLOY=1 ;;
        h) HOST=${OPTARG} ;;
        r) REMOVE=1 ;;
        s) SETUP_HOST_SSH_KEY=1 ;;
        t) TEST_APP=1 ;;
        u) USERNAME=${OPTARG} ;;
        ?) usage ; exit 1 ;;
    esac
done

if [[ -z $HOST || -z $USERNAME ]]; then
  usage
  exit 1
else
  setenv
  HOST="$USERNAME@$HOST"

  if [[ $DEPLOY -eq 1 ]]; then
    echo "INFO :: Deploying WAR to $HOST"
    undeploy_war
    deploy_war
    start_tomcat
  elif [[ $REMOVE -eq 1 ]]; then
    echo "WARNING :: Removing the application, the server, and all related files from $HOST. Are you sure you would like to do this? (y/n)"
    read yon
    if [[ $yon == "y" || $yon == "Y" ]]; then
      remove
    else
      echo "INFO :: Aborting..."
    fi
  elif [[ $TEST_APP -eq 1 ]]; then
    test_ports
  else
    echo "INFO :: Setting up SSH."
    setup_ssh
    echo "INFO :: Installing prerequisites."
    install_prereqs
    echo "INFO :: Installing Tomcat on $HOST."
    install_tomcat
    echo "INFO :: Creating NANOPAY directory on $HOST."
    create_nanopay_dir
    echo "INFO :: Deploying WAR to $HOST."
    deploy_war
    echo "INFO :: Deploying journal files to $HOST."
    deploy_journals
    echo "INFO :: Setting up Tomcat service."
    setup_tomcat_service
    echo "INFO :: Starting Tomcat service."
    start_tomcat
    echo "INFO :: Cleaning intermediary files generated for the installation and setup."
    cleanup
    echo "INFO :: Checking if the app started and is listening for connections."
    # NOTE: Must sleep for a while to allow WAR file to be deployed by Tomcat.
    sleep 7
    test_ports
    echo "INFO :: NANOPAY successfully deployed."
  fi

  exit 0
fi

# Unset error on exit
set +e
