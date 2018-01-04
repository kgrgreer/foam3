foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'PreProcessResultResponse',

  documentation: 'Represents a disbursement instruction pre-process response',

  properties: [
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Merchant unique instruction number'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.ResultCode',
      name: 'result',
      documentation: 'Pre-process result'
    }
  ]
});
