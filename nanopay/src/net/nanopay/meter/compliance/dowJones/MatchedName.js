foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'MatchedName',

  documentation: 'Matched name string',

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'The exact name that was matched in the search'
    },
    {
      class: 'String',
      name: 'nameType',
      documentation: 'the type of name field that was matched'
    }
  ]
});
