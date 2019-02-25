foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVValidator',

  documentation: `Validates a business using SecureFact LEV api.`,

  implements: [
    'net.nanopay.meter.compliance.ComplianceValidator'
  ],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.model.Business',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest',
    'net.nanopay.meter.compliance.secureFact.lev.LEVRequestService',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResult',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'canValidate',
      javaCode: `
      if ( obj instanceof Business ) {
        Business business = (Business) obj;
        if (business.getAddress().getCountryId().equals("CA")) {
          return true;
        }
      }
      return false;
        `
    },
    {
      name: 'validate',
      javaCode: ` 
      Logger logger = (Logger) getX().get("logger");
      Business business = (Business) obj;

      LEVRequestService service = new LEVRequestService();
      LEVRequest request = service.createRequest(business);
      
      LEVResponse response = service.sendRequest(request);
      response.setName(business.getBusinessName());
      response.setEntityId(business.getId());
      DAO dao = (DAO) x.get("secureFactLEVDAO");
      dao.put(response);
      if (response.getHttpCode().equals("200")) {
          LEVResult[] result = response.getResults();
          int closeMatchCounter = 0;
          for (int i=0;i<result.length;i++) {
            if (result[i].getCloseMatch()) {
              closeMatchCounter++;
            }
          }
          response.setCloseMatches(closeMatchCounter + "/" + result.length);
          dao.put(response);
          if ( closeMatchCounter == result.length ) {
            return ComplianceValidationStatus.VALIDATED;
          } else {
            return ComplianceValidationStatus.INVESTIGATING;
          }
      } else {
        if (response.getHttpCode().startsWith("4")){
          logger.error("LEV request failed with" + response.getHttpCode());
        } else if (response.getHttpCode().startsWith("5")){
          logger.error("LEV request failed with" + response.getHttpCode() + ". SecureFact server side error");
          //throw comliance error and log it
        }
      }
      return ComplianceValidationStatus.INVESTIGATING;
      `
    }
  ]
});
