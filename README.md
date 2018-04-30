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

### Build all projects and run Nanos at once
You can run the script generateAll.sh to build all projects and run the nanos, go to the NANOPAY project root folder and execute:

`./build.sh -n`

### Build All Projects and Run Tomcat At Once
You can run the script `generateAll.sh` to build all projects and run tomcat by going to the NANOPAY project root directory and executing:

`./build.sh -c`

#### Subsequent & Development Builds
To prevent Maven from re-compiling *all* of the source code everytime you change a single file, please run `./build.sh`. This will:
- It runs the Maven's development-build profile which will compile code with the `useIncrementalCompilation` flag set to `false`.
- Maven will not poll for artifact updates, but will use local ones instead.
- Dependency update checks through Codehaus Mojo will also not be run.

##### CAVEATS
- You must have run the full build `build.sh -c` at least once before as other files need to be present for the war file to built sucessfully.
- `./build.sh` will only re-build the Class files that have been updated. As such, any Class renaming or Method renaming that will not propogate the rest of the source code.
- In case of ClassNotFound or MissingMethod Exceptions, please run the full build again at least once.

### Loading a project

#### Tomcat
Visit [http://localhost:8080/nanopay/src/net/nanopay/index.html](http://localhost:8080/service/static).

#### Nanos
- **Various Projects :** Visit [http://localhost:8080/service/static](http://localhost:8080/service/static) and go into any of the submodules to view that project.
- **Nanopay :** Visit [http://localhost:8080/service/static/nanopay/src/net/nanopay/index.html](http://localhost:8080/service/static/nanopay/src/net/nanopay/index.html).

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

### Demo Deployments
For each deployment to the servers
Steps to build:
1. Fetch latest tags
   eg. git fetch --tags

3. Pull latest code
   eg. git pull origin master

4. Create a new tag with the updated code. Increment the previous tag version
   eg. git tag -a demo-v1.0.7 -m "Some tag message"

5. Push new tag to remote
  eg git push origin demo-v1.0.7

6. Open Jenkins https://jenkins.prod.nanopay.net

7. Find the project to build

8. Open project and click build now

9. Click on Console Output of the build to ensure that the latest tag was built

10. Open AWS CodeDeploy

11. Find the application and the deployment group

12. On the deployment group you can see success or failures for each build.

13. If there is a failure, a stack trace will be provided.  
