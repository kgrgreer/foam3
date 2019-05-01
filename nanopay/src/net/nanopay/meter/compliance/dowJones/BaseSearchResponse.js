foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BaseSearchResponse',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesCall',

  documentation: 'Base class model for a search response from the Dow Jones Risk Database.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'searchType'
    },
    {
      class: 'String',
      name: 'nameSearched'
    },
    {
      class: 'String',
      name: 'totalMatches'
    },
    {
      class: 'Int',
      name: 'httpStatusCode',
      documentation: 'HTTP Status Code retrieved from the HTTP GET request to the Dow Jones API'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.MetadataSearchResponse',
      name: 'metadata',
      documentation: 'Metadata retrieved from the head response data'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.BaseSearchResponseBody',
      name: 'responseBody',
      documentation: 'Body retreived from the body response data'
    }
  ],

  methods: [
    {
      name: 'getComplianceValidationStatus',
      type: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      javaCode: `
        String result = ! SafetyUtil.isEmpty(getResponseBody.getMatches()) ? getResponseBody.getMatches() : getResponseBody();
        switch (result) {
          case "ACCEPT":
            return ComplianceValidationStatus.VALIDATED;
          case "DENY":
            return ComplianceValidationStatus.REJECTED;
          case "MANUAL_REVIEW":
            return ComplianceValidationStatus.INVESTIGATING;
          default:
            return null;
        }
      `
    }
  ]
});
