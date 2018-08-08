foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingTree',
  documentation: 'A Merkle tree for storing, generating, and verifying file hashes.',

  javaImports: [
    'foam.lib.json.OutputterMode',
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256',
      documentation: 'Hashing algorithm to use.'
    },
    {
      name: 'outputter',
      javaFactory: `
        try {
          return new HashingOutputter(this, OutputterMode.STORAGE);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'parser',
      javaFactory: `return new HashedJSONParser(getX(), this);`
    }
  ]
});
