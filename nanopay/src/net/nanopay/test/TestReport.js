foam.CLASS({
  package: 'net.nanopay.test',
  name: 'TestReport',
  documentation: 'Model to store meta-data on tests.',

  ids: [ 'time' ],

  properties: [
    {
      class: 'DateTime',
      name: 'time',
      documentation: 'Timestamp of the latest report.'
    },
    {
      class: 'Long',
      name: 'totalTests',
      value: 0,
      documentation: 'Total number of tests currently in the system.'
    }
  ],
});
