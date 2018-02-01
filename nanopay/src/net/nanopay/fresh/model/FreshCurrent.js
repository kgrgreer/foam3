foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshCurrent',
  properties: [
    {
      class:'Long',
      name: 'id'
    },
//    {
//      class:'FObjectArray',
//      of: 'net.nanopay.fresh.model.FreshBusinessMembership',
//      name: 'business_memberships'
//
//    },
    {
      javaType: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'business_memberships'
    },
  ]
})