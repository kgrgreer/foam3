foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected java.util.Map<Integer, Object> fields_ = new java.util.TreeMap<>();
        `);
      }
    }
  ],
});
