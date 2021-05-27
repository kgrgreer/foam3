# -------------------------------------------------------------------------------------------------
# 05/21/21      Moorthy Rathinasamy       Initial Version
# -------------------------------------------------------------------------------------------------
#!/bin/bash

# This function checks the nanopay Service Status for the given hosts. 
# Input: config file with list of host names
function checknanopayServiceStatusForHosts {
        exec 4<$1
        while read -u4 host; do
                echo $host '- Service Status :'
        	ssh $host systemctl status nanopay
        done    
}

# This method runs the nonopay service status check for the given set of hosts
for hosts in "$@"
do      
	checknanopayServiceStatusForHosts $hosts
done

# -------------------------------------------------------------------------------------------------
