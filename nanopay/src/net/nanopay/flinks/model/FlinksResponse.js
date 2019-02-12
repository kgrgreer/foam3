//instance create when HttpStatusCode is not 200, contain all invalid login info
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksResponse',
  extends: 'net.nanopay.flinks.model.FlinksCall',

  documentation: 'model for Flinks Response',

  properties: [
    {
      class: 'Int',
      name: 'HttpStatusCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'FlinksCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'Message',
      visibility: 'RO'
    },
    {
      type: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'Links',
      visibility: 'RO'
    },
    {
      type: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      name: 'ValidationDetails',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'RequestId',
      visibility: 'RO'
    },
    {
      //type: 'net.nanopay.flinks.model.LoginModel',
      //javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      //javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.LoginModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.LoginModel',
      name: 'Login',
      visibility: 'RO'
    }
  ]
});
