foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PayoutOptions',
  requires: [ 'net.nanopay.fx.interac.model.RequiredUserFields' ],
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
      class: 'FObjectArray',
      of: 'net.nanopay.fx.interac.model.RequiredUserFields',
      name: 'requiredUserFields',
      factory: function() {
        return [
          this.RequiredUserFields.create({userType: 'Sender'}),
          this.RequiredUserFields.create({userType: 'Receiver', linkedReferenceNumber: true})
        ];
      }
    }
  ]
});
