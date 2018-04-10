foam.CLASS({
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.TransactionType',
      name: 'type',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'net.nanopay.cico.model.ServiceProvider',
      name: 'providerId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Broker',
      name: 'brokerId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.BankAccount',
      name: 'bankAccountId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'confirmationLineNumber'
    },
    {
      class: 'String',
      name: 'description'
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