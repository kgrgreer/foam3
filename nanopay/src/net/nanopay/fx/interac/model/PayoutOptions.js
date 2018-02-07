foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PayoutOptions',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'StringArray',
      name: 'payoutOptions',
      factory: function() {
        return ['A2A'];
      }
    },
    {
      class: 'String',
      documentation: 'For phase 2 FI',
      name: 'owner'
    },
    {
      class: 'String', // For now
      name: 'requiredSenderFields'
    },
    {
      class: 'String', // For now
      name: 'requiredRecipientFields'
    }
  ]
});
