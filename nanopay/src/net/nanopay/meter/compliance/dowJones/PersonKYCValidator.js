foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'PersonKYCValidator',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

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
        BaseSearchResponse response = dowJonesService.personNameSearch(x, obj.getFirstName(), obj.getSurname(), null);
        ruler.putResult(response.getComplianceValidationStatus());
      `
    }
  ]
});
