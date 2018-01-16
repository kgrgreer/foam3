foam.CLASS({
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.retail.model.Device',
      name: 'deviceId'
    }
  ]
});