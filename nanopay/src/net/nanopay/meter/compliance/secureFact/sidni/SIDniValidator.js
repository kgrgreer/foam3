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
      Logger logger = (Logger) getX().get("logger");
      User user = (User) obj;
      SIDniRequestService service = new SIDniRequestService();
      SIDniRequest request = service.createRequest(x, user);
      SIDniResponse response = service.sendRequest(request);
      response.setName(user.getLegalName());
      response.setEntityId(user.getId());
      DAO dao = (DAO) x.get("secureFactSIDniDAO");
      dao.put(response);
      if ( response.getHttpCode().equals("200") ) {
        if ( response.getVerified() ) {
          ruler.putResult(ComplianceValidationStatus.VALIDATED);
        } else {
          ruler.putResult(ComplianceValidationStatus.REJECTED);
        }
        return;
      } else {
        ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
        if ( response.getHttpCode().startsWith("4") ) {
          logger.error("SIDni request failed with" + response.getHttpCode());
        } else if ( response.getHttpCode().startsWith("5") ) {
          String message = String.format(
            "Securefact SIDni request failed with %s.", response.getHttpCode());
          logger.error(message);
          throw new RuntimeException(message);
        }
      }
      `
    }
  ]
});
