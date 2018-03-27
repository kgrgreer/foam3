# NANOPAY
Repository containing b2b, retail, common, ingenico

## Running locally

### Prerequisites
1. Brew (`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`)
2. Realpath from Coreutils (`brew install coreutils`)
3. Maven (`brew install maven`)
4. Git (`brew install git`)

### Setup
Checkout `NANOPAY`
```
git clone https://github.com/nanopayinc/NANOPAY.git
```

foam2 is added as a submodule.
Initialize the submodule
```
git submodule init
git submodule update
```

### npm 
Run npm to install required packages, such iso2022
```
npm install
```

### Installing tomcat

Go into the NANOPAY/tools directory and run the following commands:

```
./tomcatInstall.sh

```

To have tomcat automatically reload, add your development path to tomcat's configuration.
Edit `server.xml` in `$CATALINA_HOME` (defaults to `/Library/Tomcat`).
```
/Library/Tomcat/conf/server.xml
```
adding (example) a `Context docBase` to the `Host` element.
```
<Host>
  ...
  <Context docBase="Users/your_login_name/path_to_nanopay_repo/NANOPAY" path="/dev" />
</Host> 
```

### Build all projects and run Nanos at once
You can run the script generateAll.sh to build all projects and run the nanos, go to the NANOPAY project root folder and execute:

`./build.sh -n`

### Build all projects and run tomcat at once
You can run the script generateAll.sh to build all projects and run tomcat, go to the NANOPAY project root folder and execute:

`./build.sh`

### Loading a project

Visit [http://localhost:8080/static](http://localhost:8080/static) and go into any of the submodules to view that project

### Building Swift code

To build Swift code run the following command

`node swiftfoam/gen_swift.js`

### Deployments
For each deployment to the servers
Steps to build:
1. Fetch latest tags
   eg. git fetch --tags

3. Pull latest code
   eg. git pull origin master

4. Create a new tag with the updated code. Increment the previous tag version
   eg. git tag -a staging-v1.0.7 -m "Some tag message"

5. Push new tag to remote
  eg git push origin staging-v1.0.7

6. Open Jenkins https://jenkins.prod.nanopay.net

7. Find the project to build

8. Open project and click build now

9. Click on Console Output of the build to ensure that the latest tag was built

10. Open AWS CodeDeploy

11. Find the application and the deployment group

12. On the deployment group you can see success or failures for each build.

13. If there is a failure, a stack trace will be provided.  
