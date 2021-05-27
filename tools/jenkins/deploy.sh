# -------------------------------------------------------------------------------------------------
# 05/21/21      Moorthy Rathinasamy       Initial Version
# -------------------------------------------------------------------------------------------------
#!/bin/bash

GRADLE_VERSION=$(gradle -q getVersion)
TARBALL_NAME=nanopay-deploy-${GRADLE_VERSION}.tar.gz
TMP_PATH=/tmp/deploy
TARBALL=${TMP_PATH}/${TARBALL_NAME}
DEPLOY_LOGS_PATH=/tmp/nanopay/jenkins

# This mehod kicks the tarball installation
# Input: config file with list of host names
function remoteDeploy {
	exec 4<$1
	while read -u4 host; do
		DEPLOY_LOG=${DEPLOY_LOGS_PATH}/deploy_$host.log
		echo 'Deploying to Remote Host: ' $host
		tools/deployment/install_remote.sh -W$host -T${TARBALL} | tee ${DEPLOY_LOG}
	done
}

echo 'Running temp directories cleanup ...'
rm -rf ${TMP_PATH}
mkdir -p ${TMP_PATH}
rm -rf ${DEPLOY_LOGS_PATH}
mkdir -p ${DEPLOY_LOGS_PATH}
echo 'Running Remote Install/Deploy ...'
cp target/package/${TARBALL_NAME} ${TMP_PATH}/
remoteDeploy $1

# -------------------------------------------------------------------------------------------------

