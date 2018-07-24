foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PayoutOptions',
  requires: [ 'net.nanopay.fx.interac.model.RequiredUserFields' ],
  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'HIDDEN'
    },
    {
      class: 'StringArray',
      name: 'payoutOptions',
      documentation: 'Pay out options.',
      factory: function() {
        return ['A2A'];
      }
    },
    {
      class: 'String',
      documentation: 'For phase 2 FI',
      name: 'owner',
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.interac.model.RequiredUserFields',
      name: 'requiredUserFields',
      documentation: 'Requirements on users in order for pay outs to occur.',
      factory: function() {
        return [
          this.RequiredUserFields.create({userType: 'Sender'}),
          this.RequiredUserFields.create({userType: 'Receiver'})
        ];
      }
    }
  ]
});
