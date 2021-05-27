# -------------------------------------------------------------------------------------------------
# 05/21/21      Moorthy Rathinasamy       Initial Version
# -------------------------------------------------------------------------------------------------
#!/bin/bash

GRADLE_VERSION=$(gradle -q getVersion)
TARBALL_NAME=nanopay-deploy-${GRADLE_VERSION}.tar.gz
TARBALL_FILE=target/package/${TARBALL_NAME}

echo 'Checking Build Output ...'
if [[ -f ${TARBALL_FILE} ]]; then    
	echo 'Tarball file found [' $TARBALL_FILE ']. Build Successful'
else    
       echo 'Tarball file NOT found [' $TARBALL_FILE ']. Build failed'
       exit 1
fi

# -------------------------------------------------------------------------------------------------

