# retail
Retail system (FOAM version)

# Setup
- mvn install:install-file -Dfile="path/to/foam2/build/target/foam-1.0-SNAPSHOT.jar" -DgroupId=com.google -DartifcatiD=foam -Dversion=1.0 -Dpackaging=jar


# Launch API
- cd src
- sh gen.sh
- cd ../build
- mvn compile package tomcat7:run
