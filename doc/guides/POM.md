## POM - Project Object Model

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
