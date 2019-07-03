foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ExternalizedEvaluationResult',
  ids: [
    'firedRules',
    'profile',
    'reportedRule'
  ],
  properties: [
    {
      class: 'Array',
      name: 'firedRules'
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
