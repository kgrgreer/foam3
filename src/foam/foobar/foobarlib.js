foam.LIB({
  name: 'foam.Foobar',

  methods: [
    {
      name: 'flattenObject',
      documentation: `
        Converts an map with nested maps into a map with dotted-path
        keys. For example:
          { a: { a: 1, b: 2 }, b: 3 }
        becomes:
          { "a.a": 1, "a.b": 2, b: 3 }
      `,
      code: function flattenObject (inputObj, opt_parent, opt_path) {
        const out = opt_parent || {};
        const path = opt_path || [];
        for ( const k in inputObj ) {
          if ( foam.Object.isInstance(inputObj[k]) ) {
            this.flattenObject(inputObj[k], out, path.concat(k))
          } else {
            out[path.concat(k).join('.')] = inputObj[k];
          }
        }
        return out;
      }
    }
  ]
});
