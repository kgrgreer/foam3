foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ConditionResult',
  ids: [
    'test'
  ],
  properties: [
    {
      class: 'String',
      name: 'test'
    },
    {
      class: 'String',
      name: 'details'
    },
    {
      class: 'Boolean',
      name: 'fired',
      postSet: function(o, n) {
        this.firedString = n === false ? "false" : "true";
      },
      hidden: true
    },
    {
      class: 'String',
      name: 'firedString',
      label: 'Fired'
    },
    {
      class: 'Boolean',
      name: 'waitingForData'
    }
  ]
})
