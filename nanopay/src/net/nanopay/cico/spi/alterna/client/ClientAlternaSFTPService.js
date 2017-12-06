foam.CLASS({
  package: 'net.nanopay.cico.spi.alterna.client',
  name: 'ClientAlternaSFTPService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.cico.spi.alterna.SFTPService',
      name: 'delegate'
    }
  ]
});
