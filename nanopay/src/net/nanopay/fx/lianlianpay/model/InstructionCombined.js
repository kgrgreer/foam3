foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'InstructionCombined',

  documentation: 'Represents a combined disbursement instruction',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.lianlianpay.model.InstructionCombinedSummary',
      name: 'summary',
      documentation: 'Summary information'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.lianlianpay.model.InstructionCombinedRequest',
      name: 'requests',
      documentation: 'Disbursement instruction requests'
    }
  ]
});
