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
      name: 'confirmationLineNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'description',
      swiftName: 'description_',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Map',
      name: 'paymentData',
      document: 'store data that need for payment platform'
    }
  ]
});