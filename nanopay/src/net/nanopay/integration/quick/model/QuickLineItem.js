foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickLineItem',
  properties: [
    {
      class: 'Double',
      name: 'Amount'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickLinkTxn',
      name: 'LinkedTxn',
    }
  ]
});
