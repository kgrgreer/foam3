foam.CLASS({
  package: 'net.nanopay.tx.alterna.client',
  name: 'ClientAlternaSFTPService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.tx.alterna.SFTPService',
      name: 'delegate'
    }
  ]
});
