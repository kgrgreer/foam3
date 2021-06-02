# -------------------------------------------------------------------------------------------------
# 05/21/21      Moorthy Rathinasamy       Initial Version
# -------------------------------------------------------------------------------------------------
#!/bin/bash

BUILD_FILE=ca-central-development-mediators-build.sh
MEDIATORS=tools/medusa/ca-central-development-mediators
NODES=tools/medusa/ca-central-development-nodes
SERVICE_HEALTH_URLS=tools/jenkins/services-ca-central-development-mediators


echo '********************************************************************************************'
echo '------------------------------------------- PRE-BUILD  -------------------------------------'
echo '********************************************************************************************'
echo 'Running Pre-build echecks ...'
tools/jenkins/pre_build.sh

echo '********************************************************************************************'
echo '------------------------------------------ BUILD  ------------------------------------------'
echo '********************************************************************************************'
echo 'Running base Build (with -i ) ...'
./build.sh -i
echo 'Running build [' $BUILD_FILE '] ...'
tools/medusa/$BUILD_FILE

echo '********************************************************************************************'
echo '---------------------------------------- POST BUILD  ---------------------------------------'
echo '********************************************************************************************'
echo 'Running Post Build Valiation ...'
tools/jenkins/post_build.sh

echo '********************************************************************************************'
echo '------------------------------------------ PRE-DEPLOY  -------------------------------------'
echo '********************************************************************************************'
echo 'Running Pre-Deploy checks ...'
echo 'Running Mediator(s) & Node(s) Service Status Check ...'
tools/jenkins/pre_deploy.sh $NODES $MEDIATORS

echo '********************************************************************************************'
echo '-------------------------------------------- DEPLOY  ---------------------------------------'
echo '********************************************************************************************'
echo 'Stopping Mediator(s) Service ...'
tools/medusa/stop.sh $MEDIATORS
echo 'Running Nodes backup ...'
tools/medusa/backup-ledger.sh tools/medusa/ca-central-development-nodes
echo 'Running Remote Install/Deploy ...'
tools/jenkins/deploy.sh $MEDIATORS

echo '********************************************************************************************'
echo '----------------------------------------POST-DEPLOY  ---------------------------------------'
echo '********************************************************************************************'
echo 'Waiting three minutes to allow the services & health checks to be fully ready'
sleep 180
echo 'Running Post Deploy Checks ...' 
tools/jenkins/post_deploy.sh $SERVICE_HEALTH_URLS $NODES $MEDIATORS

# -------------------------------------------------------------------------------------------------

