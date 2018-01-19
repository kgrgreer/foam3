//instance create when HttpStatusCode is not 200, contain all invalid login info
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksResponse',
  extends: 'net.nanopay.flinks.model.FlinksCall',

  documentation: 'model for Flinks Response',

  properties: [
    {
      class: 'Int',
      name: 'HttpStatusCode'
    },
    {
      class: 'String',
      name: 'FlinksCode'
    },
    {
      class: 'String',
      name: 'Message'
    },
    {
      javaType: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'Links'
    },
    {
      javaType: 'foam.lib.json.UnknownFObject',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      name: 'ValidationDetails'
    },
    {
      class: 'String',
      name: 'RequestId'
    },
    {
      //javaType: 'net.nanopay.flinks.model.LoginModel',
      //javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      //javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.LoginModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.LoginModel',
      name: 'Login'
    }
  ]
});