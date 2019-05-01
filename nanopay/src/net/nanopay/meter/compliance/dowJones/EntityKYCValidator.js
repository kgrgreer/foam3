foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'EntityKYCValidator',

  documentation: 'Validates an entity using Dow Jones Risk and Compliance API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  properties: [
    {
      class: 'Int',
      name: 'stage',
      value: 1
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        BaseSearchResponse response = dowJonesService.entityNameSearch(x, obj.getOrganization(), null);
        ruler.putResult(response.getComplianceValidationStatus());
      `
    }
  ]
});
