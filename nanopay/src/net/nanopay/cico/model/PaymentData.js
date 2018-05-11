foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'PaymentData',
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
      of: 'net.nanopay.cico.model.MobileType',
      name: 'mobileType'
    },
    {
      class: 'String',
      name: 'currency',
      value: 'CAD'
    }
  ]
});
