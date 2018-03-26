foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PadCapture',

  documentation: 'Captures the event when a bank has been PAD authorizated.',
  javaImports: [ 'java.util.Date' ],
  requires: [
    'foam.nanos.auth.Address',
  ],
  properties: [
    {
      class: 'Long',
      name: 'id',
      max: 999,
    },
    {
      class: 'DateTime',
      name: 'acceptanceTime',
      label: 'Time of Acceptance',
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();',
    },
    {
      class:'String',
      name: 'termNC',
    },
    {
      class:'Long',
      name: 'userId',
    },
    {
      class:'String',
      name: 'firstName',
    },
    {
      class:'String',
      name: 'lastName',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      factory: function () { return this.Address.create(); },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
  ]
})