foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Fee',

  documentation: 'Describes the fee type.',

  abstract: true,
  implements: ['net.nanopay.tx.model.FeeInterface'],
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.FeeType',
      name: 'type',
      documentation: 'Determines fee type.'
    },
    {
      name: 'isPassThroughFee',
      class: 'Boolean',
      value: false
    },
  ]
 });
