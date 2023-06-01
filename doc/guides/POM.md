## POM - Project Object Model

## POM Attributes

### name

### version

### excludes

### projects

### files

#### flags

### JSLib

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
