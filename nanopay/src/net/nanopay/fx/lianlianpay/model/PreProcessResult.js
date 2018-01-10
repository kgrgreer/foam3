foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'PreProcessResult',

  documentation: 'Represents a pre-process result',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.lianlianpay.model.PreProcessResultSummary',
      name: 'summary',
      documentation: 'Summary information'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.lianlianpay.model.PreProcessResultResponse',
      name: 'responses',
      documentation: 'Disbursement instruction pre-process response'
    }
  ]
});
