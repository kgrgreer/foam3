foam.CLASS({
  package: 'net.nanopay.security.PII',
  implements: [
    'net.nanopay.security.PII.PII'
  ],
  name: 'PIIReportGenerator',
  documentation: 'handles User PII (personally identifiable information) reporting and requests',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.security.PII.ViewPIIRequests',
    'org.json.simple.JSONObject'
  ],

  imports: [
    'userDAO',
    'viewPIIRequestsDAO',
  ],

  methods: [
    {
      name: 'getPIIData',
      documentation: 'return an array of all model properties that contain PII',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userID',
          class: 'Long'
        }
      ],
      javaReturns: 'JSONObject',
      javaCode:
        `
  // Find the user
  DAO userDAO = (DAO) x.get("userDAO");
  User user = (User) userDAO.find_(x, userID );
  
  JSONObject propertyValueJson = new JSONObject();

  // Iterate through properties of User, push to jsonObject if they containPII
  List axioms = foam.nanos.auth.User.getOwnClassInfo().getAxioms();
  for (Object propertyObject : axioms) {
    foam.core.PropertyInfo property = (foam.core.PropertyInfo) propertyObject;
    if ( property.containsPII() ) {
      try {
        propertyValueJson.put(property.getName() , property.get(user).toString());
      } catch (Exception e) {
      // ignore cases in which PII field is null
        ; 
      }
    }      
    }           
  return propertyValueJson;
      `
    },
    {
      name: 'addTimeToPIIRequest',
      documentation: 'adds a date object to the DownloadedAt property of ViewPIIRequests',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'PIIRequestID',
          class: 'Long'
        }
      ],
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  // get PIIRequest with id
  net.nanopay.security.PII.ViewPIIRequests PIIRequest = (net.nanopay.security.PII.ViewPIIRequests) vprDAO.find_(x, PIIRequestID);
  ArrayList downloadedAt =  PIIRequest.getDownloadedAt();
  
  // Add current time to downloadedAt and put back into DAO
  Date d = new Date();
  downloadedAt.add(d);
  PIIRequest.setDownloadedAt(downloadedAt);
  vprDAO.put(PIIRequest);
  `
    }
  ],
});
