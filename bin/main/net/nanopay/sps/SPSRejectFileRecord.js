foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'SPSRejectFileRecord',

  properties: [
    {
      class: 'String',
      name: 'TID',
    },
    {
      class: 'String',
      name: 'Batch_ID'
    },
    {
      class: 'String',
      name: 'Routing'
    },
    {
      class: 'String',
      name: 'Account'
    },
    {
      class: 'String',
      name: 'Amount'
    },
    {
      class: 'String',
      name: 'Other_Invoice'
    },
    {
      class: 'String',
      name: 'Reason'
    },
    {
      class: 'String',
      name: 'ChargeBack'
    },
    {
      class: 'String',
      name: 'Item_ID'
    }
  ]
});
