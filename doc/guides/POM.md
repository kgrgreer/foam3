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
Optional property which is used as the Maven <groupId> when generating a Maven POM. If not specified, then the name: property is used instead.

### version
Optional property which is used as the Maven <version> when generating a Maven POM. Is also used as part of the filename when creating foam-bin JS files.

### licenses
Specify license(s) to be included in the packaged JS binaries.
All licenses from sub-projects are included, with duplicates removed.

```javascript
licenses: `
  [2023] Acme Corporation
  All Rights Reserved.
`,
Or
licenses: [
  `
  [2023] Acme Corporation
  All Rights Reserved.
`,
`
  [2023] Our Authors
  All Rights Reserved.
`
]
```

### stages
Stages provides information about which source files should appear in each stage
of JS loading. If a file does not appear in stages:, then it defaults to the stage
specified by defaultStage:, which itself defaults to 0 if not specified.
The first stage to be loaded is stage 0 and is stored in the file named foam-bin-version.js.
Later stages are named foam-bin-version-stage.js.
The first 0 stage should contain all sources needed during your initial screen.
The second 1 stage should contain sources likely to be needed.
Later stages should include test or debug code, or code very unlikely to be needed.
The use of stages is optional, but restricting your 0'th stage to only essential
files helps with startup time.

Ex.
```
  defaultStage: 0, // redundant
  stages: {
    1: [
      "foam3/src/foam/u2/wizard/pom",
      "foam3/src/foam/graphics/CView",
      "foam3/src/foam/u2/AllViews"
    ],
    2: [
      "foam3/src/foam/core/debug"
    ]
  }
```

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

Like adding a JSLib Axiom. Is read by POM() in foam.js in development mode and by the VirtualHostRoutingServlet when running from foam-bin.js.
TODO: Add support to VirtualHostRoutingServlet for loading JSLibs.


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
  defaultStage: 0, // redundant
  stages: {
    1: [
      "foam3/src/foam/u2/wizard/pom",
      "foam3/src/foam/graphics/CView",
      "foam3/src/foam/u2/AllViews"
    ],
    2: [
      "foam3/src/foam/core/debug"
    ]
  },
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
