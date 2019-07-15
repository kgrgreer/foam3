foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingResultReport',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'DateTime',
      name: 'time'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.accounting.IntegrationCode',
      name: 'integrationCode'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.accounting.ResultResponse',
      name: 'resultResponse'
    },
  ]
});
