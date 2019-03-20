foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniValidator',

  documentation: `Validates a user using SecureFact SIDni api.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.model.Business',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniRequestService'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        SIDniRequestService service = new SIDniRequestService();
        SIDniRequest request = service.createRequest(x, user);
        SIDniResponse response = service.sendRequest(x, request);
        response.setName(user.getLegalName());
        response.setEntityId(user.getId());
        ((DAO) x.get("secureFactSIDniDAO")).put(response);
        ruler.putResult(
          response.getVerified()
            ? ComplianceValidationStatus.VALIDATED
            : ComplianceValidationStatus.INVESTIGATING
        );
      `
    }
  ]
});
