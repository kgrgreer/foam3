foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniValidator',

  documentation: `Validates a user using SecureFact SIDni api.`,

  implements: [
    'net.nanopay.meter.compliance.ComplianceValidator'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.model.Business',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniErrors',
    'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniRequestService',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'canValidate',
      javaCode: `
        if ( obj instanceof User && ! ( obj instanceof Business )) {
          User user = (User) obj;
          if ( user.getAddress().getCountryId().equals("CA") ) {
            return true;
          }
        }
        return false;
        `
    },
    {
      name: 'validate',
      javaCode: `
      System.out.println("---------------------------------------------------------------");
      Logger logger = (Logger) getX().get("logger");
      User user = (User) obj;
      SIDniRequestService service = new SIDniRequestService();
      SIDniRequest request = service.createRequest(user);
      BasicResponseObject response = service.sendRequest(request);
            if (response.getHttpCode().equals("200")) {
              SIDniResponse sidniResponse = (SIDniResponse) response;
              DAO dao = (DAO) x.get("secureFactSIDniDAO");
              dao.put(sidniResponse);
               if (sidniResponse.getVerified()) {
                 return ComplianceValidationStatus.VALIDATED;
               } else {
                 return ComplianceValidationStatus.REJECTED;
               }
            } else {
              SIDniErrors sidniErrors = (SIDniErrors) response;
              if (sidniErrors.getHttpCode().startsWith("4")){
                System.out.println(sidniErrors);
                logger.error("SIDni request failed with" + sidniErrors.getHttpCode());
              } else if (sidniErrors.getHttpCode().startsWith("5")){
                logger.error("SIDni request failed with" + sidniErrors.getHttpCode() + ". SecureFact server side error");
                //throw comliance error and log it
              }
            }
      return ComplianceValidationStatus.INVESTIGATING;
      `
    }
  ]
});
