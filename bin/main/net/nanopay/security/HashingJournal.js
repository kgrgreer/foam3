foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256',
      documentation: 'Hashing algorithm to use'
    },
    {
      class: 'Boolean',
      name: 'digestRequired',
      value: false,
      documentation: 'Flag to determine if digest is required when parsing'
    },
    {
      class: 'Boolean',
      name: 'rollDigests',
      value: false,
      documentation: 'Roll digests together'
    },
    {
      class: 'Object',
      name: 'previousDigest',
      type: 'Byte[]',
      documentation: 'Previous digest to use in rolling'
    },
    {
      name: 'outputter',
      javaFactory: `
        try {
          return new HashingOutputter(getX(), this);
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
