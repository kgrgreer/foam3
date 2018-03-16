foam.CLASS({
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.TransactionStatus',
      name: 'cicoStatus'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.TransactionType',
      name: 'type'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.cico.model.ServiceProvider',
      name: 'providerId'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Broker',
      name: 'brokerId'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.BankAccount',
      name: 'bankAccountId'
    },
    {
      class: 'String',
      name: 'returnCode'
    },
    {
      class: 'String',
      name: 'returnDate'
    },
    {
      class: 'String',
      name: 'returnType'
    }
  ]
});