foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountStatementModel',

  documentation: 'model for the Flinks account statement model',

  properties: [
    {
      class: 'String',
      name: 'UniqueId'
    },
    {
      class: 'String',
      name: 'FileType'
    },
    {
      class: 'String',
      name: 'Base64Bytes'
    }
  ]
});