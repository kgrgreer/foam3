foam.CLASS({
  package: 'net.nanopay.security',
  name: 'SigningJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Signing algorithm',
      value: 'SHA256withRSA'
    }
  ]
});
