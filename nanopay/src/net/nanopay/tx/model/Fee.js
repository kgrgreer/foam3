foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Fee',
  abstract: true,
  implements: ['net.nanopay.tx.model.FeeInterface'],
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.FeeType',
      name: 'type'
    }
  ]
 });