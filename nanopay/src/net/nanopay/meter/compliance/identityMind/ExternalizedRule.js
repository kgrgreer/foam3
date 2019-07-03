foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ExternalizedRule',
  ids: [
    'ruleId'
  ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'details'
    },
    {
      class: 'String',
      name: 'resultCode'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.identityMind.ConditionResult',
      name: 'testResults',
      view: 'foam.u2.view.FObjectArrayTableView'
    },
    {
      class: 'Int',
      name: 'ruleId',
      documentation: `The unique rule identifier.`
    },
  ]
});
