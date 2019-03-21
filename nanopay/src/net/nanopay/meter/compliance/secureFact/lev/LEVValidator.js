foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVValidator',

  documentation: `Validates a business using SecureFact LEV api.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.Arrays',
    'net.nanopay.model.Business',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResult'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        LEVRequestService service = new LEVRequestService();
        LEVRequest request = service.createRequest(x, business);
        LEVResponse response = service.sendRequest(x, request);
        response.setName(business.getBusinessName());
        response.setEntityId(business.getId());
        // Aggregate close matches
        LEVResult[] results = response.getResults();
        long closeMatchCounter = Arrays.stream(results).filter(
          o -> o.getCloseMatch()
        ).count();
        response.setCloseMatches(closeMatchCounter + " / " + results.length);
        ((DAO) x.get("secureFactLEVDAO")).put(response);
        ruler.putResult(
          closeMatchCounter == results.length
            ? ComplianceValidationStatus.VALIDATED
            : ComplianceValidationStatus.INVESTIGATING
        );
      `
    }
  ]
});
