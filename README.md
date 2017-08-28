# NANOPAY
Repository containing b2b, retail, common, admin-portal, ingenico

## Running locally

### Prerequisites
1. Maven (`brew install maven`)
2. Git (`brew install git`)

### Setup
Checkout `foam2` and `NANOPAY` repositories into the same directory

```
git clone https://github.com/foam-framework/foam2.git
git clone https://github.com/nanopayinc/NANOPAY.git
```

### Build all projects and run Nanos at once
You can run the script generateAll.sh to build all projects and run the nanos, go to the NANOPAY project root folder and execute:

`sh generateAll.sh`
OR
`./generateAll.sh`


### Build manual procedures

1. Copy the services file from foam2 to the current directory

`cp foam2/src/services .`

2. Build foam2

```
cd foam2/src
./gen.sh
cd ../build
mvn compile package
mvn install:install-file -Dfile="target/foam-1.0-SNAPSHOT.jar" -DgroupId=com.google -DartifactId=foam -Dversion=1.0 -Dname=foam -Dpackaging=jar
cd ../..
```

3. Build NANOPAY

```
cd NANOPAY
./gen.sh
mvn compile package
cd ..
```

4. Run NANOS

```
./NANOPAY/tools/nanos.sh
```

### Loading a project

Visit [http://localhost:8080/static/NANOPAY](http://localhost:8080/static/NANOPAY) and go into any of the submodules to view that project

### Compiling a single module

To compile a single module run the following command:

```
cd ./{project}/src
./gen.sh
cd ../..
mvn -pl {project} {command}
```

where:
 - project is the project name (i.e common, b2b, etc)
 - command is the command you which to run (i.e. clean, compile, package, etc)
