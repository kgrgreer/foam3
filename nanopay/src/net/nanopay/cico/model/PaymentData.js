foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'PaymentData',
  documentation: 'PaymentData is used to store payment information that is required to process a transaction by using a specified payment platform',
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.PaymentType',
      name: 'type'
    },
    {
      class: 'String',
      name: 'merchantId',
      documentation: 'Realex merchantId: varipay'
    },
    {
      class: 'String',
      name: 'token'
    },
    {
      class: 'Long',
      name: 'paymentCardId'
    },
    {
      class: 'String',
      name: 'cvn',
      required: true,
      storageTransient: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.MobileWallet',
      name: 'mobileWallet'
    },
    {
      class: 'Reference',
      targetDAOKey: 'currencyDAO',
      name: 'currencyId',
      of: 'net.nanopay.model.Currency'
    }
  ]
});
