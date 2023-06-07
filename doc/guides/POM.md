## POM - Project Object Model

## Purpose

The purpose of a POM file is to provide the information needed to build or execute a FOAM project. It is used by for both Web and NodeJS JS applications and for Java server applications.

For pre-packaged JS web apps, the tool genjs.js will read a pom and create a single .js file containing a minified collection of all required .js files.

For non-packaged JS web apps, the web app will download and process the POM directly.

For server-side Java apps, genjava.js will process to POM and compile the resulting body
of .java source files.

## POM Attributes

### name

### version

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

### JSLib

Like adding a JSLib Axiom. Is read by foam.nanos.servlet.VirtualHostRoutingServlet.


## Example

```javascript
foam.POM({
  name: "acme.app",
  version: '3.1.1',
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
  JSLibs: [
    'https://cdn.somecompany.com/link/v2/stable/lib.js'
  ]
});
```
