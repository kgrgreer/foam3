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
      class: 'Object',
      name: 'outputter',
      javaType: 'net.nanopay.security.HashingOutputter',
      javaFactory: `
        try {
          return new HashingOutputter(getAlgorithm(), OutputterMode.STORAGE);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'Object',
      name: 'parser',
      javaType: 'net.nanopay.security.HashedJSONParser',
      javaGetter: 'return getX().create(HashedJSONParser.class);'
    }
  ]
});
