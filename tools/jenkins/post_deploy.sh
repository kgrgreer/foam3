# -------------------------------------------------------------------------------------------------
# 05/21/21      Moorthy Rathinasamy       Initial Version
# -------------------------------------------------------------------------------------------------
#!/bin/bash

DEPLOY_LOGS_PATH=/tmp/nanopay/jenkins

# This function checks the status of nanopay service. Writes the output to a temporary local file
# hostname
function checknanopayServiceStatus {
	exec 4<"$1"
        while read -u4 host; do
		echo $host '- Service Status :'
	        SERVICE_STATUS_LOG=${DEPLOY_LOGS_PATH}/service_status_$host.log
        	ssh $host systemctl status nanopay | tee ${SERVICE_STATUS_LOG}
        done
}

# To Do - Write script to parse logs and service hits to see if the deployment was successful
function validateLogs {
	for logFile in "$DEPLOY_LOGS_PATH"/*
		do
  			if [[ $logFile == *"service_status_"* ]]; then
				echo 'Validating Service Status: ' $logFile
				validateServiceStatus $logFile
			elif [[ $logFile == *"deploy_"* ]]; then
                                echo 'Deploy Status Log File: ' $logFile
				validateInstallStatus $logFile
			else
				echo 'Unknown/Invliad Log File: ' $logFile	
			fi
	done
}

# This method looks for 'active(running)' text in the given Service Status log. 
# If it doesn't find the expected test, this method returns a non-zero value to the Caller (Jenkins)
function validateServiceStatus {
	serviceRunningFlag=false
	exec 4<$1
	while read -u4 logLine; do
		if [[ $logLine == *"active (running)"* ]]; then
			echo 'Service Status Validation Success [' $logLine ']'
			serviceRunningFlag=true
			break
		fi
	done
	if [ "$serviceRunningFlag" = false ]; then
                echo 'Service Status Validation failed'
                overallStatusFlag=false
        fi
}

# This method looks for 'Remote install successful' text in the given Deploy log. 
# If it doesn't find the expected test, this method returns a non-zero value to the Caller (Jenkins)
function validateInstallStatus {
        installSuccessfulFlag=false
        exec 4<$1
        while read -u4 logLine; do
                if [[ $logLine == *"Remote install successful"* ]]; then
                        echo 'Remote install/deploy Validation Success [' $logLine ']'
                        installSuccessfulFlag=true
                        break
                fi
        done
        if [ "$installSuccessfulFlag" = false ]; then
                echo 'Remote install/deploy Validation failed'
                overallStatusFlag=false
        fi
}

# This method checks the Service Health for the given URL. 
# If it doesn't return 200, this method returns a non-zero value to the Caller (Jenkins)
function runServiceHealthCheck {
	exec 4<$1
	while read -u4 serviceHealthURL; do
		echo 'Running Service Check: ' $serviceHealthURL
		# Only fetch HTTP Code. -k added to ignore SSL Certificate issues/verification
		HTTP_STATUS="$(curl -IL -k --silent $serviceHealthURL | grep HTTP )";
		echo 'HTTP Response Code: ' $HTTP_STATUS
		if [[ $HTTP_STATUS != *" 200 "* ]]; then
                        echo 'Service Health Check failed'
			overallStatusFlag=false
                fi
	done
}

HEALTH_CHECK_URLS=$1
NODES=$2
overallStatusFlag=true

# Check the nanopay Service Status
echo 'Checking nanopay Service Status ...'
checknanopayServiceStatus $NODES
# If there is a 3rd argument, consider that as mediator input
if [ $# -eq 3 ]
  then
    	checknanopayServiceStatus $3
fi

# Parse the logs and validate the deploy
echo 'Verifying install logs ...'
validateLogs

# Run Service Health Check
echo 'Performing Health check ... '
runServiceHealthCheck $HEALTH_CHECK_URLS

# Calculate the overall status
if [ "$overallStatusFlag" = false ]; then
	echo 'ERROR :: Build / Remote Deploy / Start Service Failed. Review log(s) for more details'
	exit 1
fi

# -------------------------------------------------------------------------------------------------

