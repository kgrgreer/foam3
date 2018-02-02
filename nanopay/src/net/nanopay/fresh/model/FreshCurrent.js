foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshCurrent',
  properties: [
    {
      class:'FObjectArray',
      of: 'net.nanopay.fresh.model.FreshBusinessMembership',
      name: 'business_memberships'
    }
  ]
})