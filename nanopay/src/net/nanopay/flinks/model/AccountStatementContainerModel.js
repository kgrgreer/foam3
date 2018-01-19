foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountStatementContainerModel',

  documentation: 'model for the Flinks account statement container model',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountStatementModel',
      name: 'Statements'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    }
  ]
});