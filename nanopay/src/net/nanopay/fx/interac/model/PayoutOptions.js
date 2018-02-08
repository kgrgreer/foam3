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
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredUserFields',
      name: 'requiredSenderFields',
      factory: function() {
        var fields = this.RequiredUserFields.create();
        fields.userType = 'Sender';
        return fields;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredUserFields',
      name: 'requiredReceiverFields',
      factory: function() {
        var fields = this.RequiredUserFields.create();
        fields.userType = 'Receiver';
        fields.linkedReferenceNumber = true;
        return fields;
      }
    }
  ]
});
