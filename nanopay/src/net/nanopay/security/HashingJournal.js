foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.FileJournal',

  javaImports: [
    'foam.lib.json.OutputterMode',
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256'
    },
    {
      class: 'Boolean',
      name: 'rollDigests',
      value: false
    },
    {
      class: 'Object',
      name: 'previousDigest',
      javaType: 'byte[]'
    },
    {
      name: 'outputter',
      javaFactory: `
        try {
          return new HashingOutputter(getAlgorithm(), OutputterMode.STORAGE);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'parser',
      javaFactory: `return getX().create(HashedJSONParser.class);`
    }
  ]
});
