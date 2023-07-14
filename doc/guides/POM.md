## POM - Project Object Model

## Purpose

The purpose of a POM file is to provide the information needed to build or execute a FOAM project. It is used by for both Web and NodeJS JS applications and for Java server applications.

For pre-packaged JS web apps, the tool genjs.js will read a pom and create a single .js file containing a minified collection of all required .js files.

For non-packaged JS web apps, the web app will download and process the POM directly.

For server-side Java apps, genjava.js will process to POM and compile the resulting body
of .java source files.

## POM Attributes

### name

### vendorId

### version

### licenses

### excludes

### projects

### files

#### flags

```
flags: "java"   		same as   flags: [ "java" ]
flags: "java|web" 	same as   flags: [ "java", "web" ]

flags: "web&debug" 	same as
predicate: () => foam.flags.web && foam.flags.debug;

Can combine | and &:
flags: "java|web&debug"   (& is higher precedence)
```

#### predicate

A predicate can be supplied which should return true if the file is to be loaded.
This is useful for conditionally loading polyfills or for implementing logic more complex
can be specified with & and | alone.

### javaDependencies

A list of Java Maven library dependencies.

### tasks

A list of POM-specific build tasks. Allow for adding new build tasks, overwriting
existing tasks and defining before and after tasks.

### JSLib

Like adding a JSLib Axiom. Is read by foam.nanos.servlet.VirtualHostRoutingServlet.


## Example

```javascript
foam.POM({
  name: "acmeapp",
  vendorId: 'com.acme",
  version: '3.1.1',
  licenses: `
    [2023] Acme Corporation
    All Rights Reserved.
  `,
  tasks: [
    // call before `versions' task
    function before_versions() {
      console.log('---------- before versions');
    },

    // overwrite `versions' task
    function versions() {
      // call `myVersions' task
      myVersion();
    },

    // call after `versions' task
    function after_versions(build) {
      console.log('---------- after versions');
    },

    // define new task
    function myVersion() {
      // access to `JAR_OUT' env variable
      console.log('---------- my versions', JAR_OUT);
    }
  ],
  excludes: [
    'Something.java'
  ],
  files: [
    { name: "acme.app.Foo", flags: "js" },
    { name: "acme.app.Bar", flags: "js|java" },
    { name: "acme.app.Demo", flags: "demo&ava" },
  ],
  projects: [
    { name: 'acme/src/somepackage/pom' },
    { name: 'acme/src/someotherpackage/pom' },
  ],
  javaDependencies: [
    'commons-net:commons-net:3.6',
    'xerces:xercesImpl:2.12.0'
  ],
  JSLibs: [
    'https://cdn.somecompany.com/link/v2/stable/lib.js'
  ]
});
```
