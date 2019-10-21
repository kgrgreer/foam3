foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'PaymentAccountInfo',
  documentation: 'PaymentAccountInfo is used to store payment information that is required to process a transaction by using a specified payment platform',
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.CICOPaymentType',
      name: 'type'
    },
    {
      class: 'String',
      name: 'token'
    },
    {
      class: 'Currency',
      name: 'fee'
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
      // targetDAOKey: 'currencyDAO',
      name: 'currencyId',
      of: 'net.nanopay.exchangeable.Currency'
    }
  ]
});
