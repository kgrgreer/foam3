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
      value: true
    },
    {
      class: 'String',
      name: 'previousDigest'
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
