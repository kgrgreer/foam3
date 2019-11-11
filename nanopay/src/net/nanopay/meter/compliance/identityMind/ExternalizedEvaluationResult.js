foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ExternalizedEvaluationResult',

  properties: [
    {
      name: 'firedRules',
      type: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.ExternalizedRule',
      name: 'reportedRule'
    },
    {
      class: 'String',
      name: 'profile'
    }
  ]
});
