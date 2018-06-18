foam.CLASS({
  package: 'net.nanopay.cico.driver.alterna.client',
  name: 'ClientAlternaSFTPService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.cico.driver.alterna.SFTPService',
      name: 'delegate'
    }
  ]
});
