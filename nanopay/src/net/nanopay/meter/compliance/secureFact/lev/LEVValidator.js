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
      return obj instanceof Business;
        `
    },
    {
      name: 'validate',
      javaCode: `
      System.out.println("---------------------------------------------------------------");
      Logger logger = (Logger) getX().get("logger");
      Business business = (Business) obj;

      LEVRequestService service = new LEVRequestService();
      LEVRequest request = service.createRequest(business);
      
      LEVResponse response = service.sendRequest(request);
      
      if (response.getHttpCode().equals("200")) {
        DAO dao = (DAO) x.get("secureFactLEVDAO");
        dao.put(response);
          LEVResult[] result = response.getResults();
          int closeMatchCounter = 0;
          for (int i=0;i<result.length;i++) {
            if (result[i].getCloseMatch()) {
              closeMatchCounter++;
            }
          }
          // if number of close matches makes majority auto verify for now. ask scott later
          if ( closeMatchCounter > java.lang.Math.ceil(result.length/2)) {
            return ComplianceValidationStatus.VALIDATED;
          } else {
            return ComplianceValidationStatus.REJECTED;
          }
      } else {
        if (response.getHttpCode().startsWith("4")){
          System.out.println(response);
          logger.error("LEV request failed with" + response.getHttpCode());
        } else if (response.getHttpCode().startsWith("5")){
          logger.error("LEV request failed with" + response.getHttpCode() + ". SecureFact server side error");
          //throw comliance error and log it
          throw new ComplianceValidationException("SecureFact LEV request failed with " + response.getHttpCode() + ". SecureFact server side error.");
        }
      }
      return ComplianceValidationStatus.INVESTIGATING;
      `
    }
  ]
});
