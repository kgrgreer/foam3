foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'MonitoringReport',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of the om'
    },
    {
      class: 'Int',
      name: 'sentRequests'
    },
    {
      class: 'Int',
      name: 'receivedResponses'
    },
    {
      class: 'Boolean',
      name: 'alarm'
    },
    {
      class: 'DateTime',
      name: 'date'
    }
  ],

});
