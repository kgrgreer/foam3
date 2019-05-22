foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesResponse',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesCall',

  documentation: 'Base class model for a search response from the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'userId',
      visibility: 'RO'
    },
    {
      class: 'Date',
      name: 'searchDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'searchType',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'nameSearched',
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'totalMatches',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'approvalStatus',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['True Match', 'False Positive']
      }
    },
    {
      class: 'String',
      name: 'notes',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 40 }
    },
    {
      class: 'Int',
      name: 'httpStatusCode',
      visibility: 'RO',
      documentation: 'HTTP Status Code retrieved from the HTTP GET request to the Dow Jones API'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MetadataSearchResponse',
      name: 'metadata',
      visibility: 'RO',
      documentation: 'Metadata retrieved from the head response data'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponseBody',
      name: 'responseBody',
      visibility: 'RO',
      documentation: 'Body retreived from the body response data'
    }
  ]
});
