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

### Configuration

Have the build script inialize submodules, update node and tomcat libraries, and setup a docbase so tomcat automatically reloads on javascript changes.

NOTE: you will be prompted for your system password during the tomcat installation.

```
cd NANOPAY
build.sh -i
```

#### Indidual Configuration Components
##### FOAM2 SubModule
foam2 is added as a submodule.
Initialize the submodule
```
git submodule init
git submodule update
```

##### npm 
Run npm to install required packages, such iso2022
```
npm install
```

##### Installing tomcat

Go into the NANOPAY/tools directory and run the following commands:

```
./tomcatInstall.sh

```

##### Tomcat docBase
To have tomcat automatically reload, add your development path to tomcat's configuration.
Edit `server.xml` in `$CATALINA_HOME` (defaults to `/Library/Tomcat`) as follows:

NOTE: this can be added/updated at any time by running *build.sh -i*
```
/Library/Tomcat/conf/server.xml
```

```
<Host>
  ...
  <Context docBase="${catalina_doc_base}" path="/dev" />
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

### Branching 
We are following the OneFlow git branching strategy as described http://endoflineblog.com/oneflow-a-git-branching-model-and-workflow and https://barro.github.io/2016/02/a-succesful-git-branching-model-considered-harmful/.  It is similar to GitFlow http://nvie.com/posts/a-successful-git-branching-model/ with the exception of using rebase and not using developer sub team branches (branches just shared between developers). 
* `master` branch is the lastest stable release. 
* `development` branch is the work in progress.
* `staging` is similar to the documented `release` branches.
* `staging` bugfixes are PR'd on the staging branch and will be merged/cherry-picked back into `development` branch.
* `release` hotfixes are PR'd on the release branch and will be merged/cherry-picked back into the `development` branch.

Picture of nanopay git flow: https://drive.google.com/file/d/0B1fbZtuULvxQM29JaEhiWnZYSU11QkpyVW5FTnBSNW1WOXhz/view?usp=sharing

### Versioning
Versioning follows the Semantic Versioning principles: https://semver.org/

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
