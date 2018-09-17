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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.mlang.MLang',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.security.PII.ViewPIIRequests',
    'net.nanopay.security.PII.PIIRequestStatus',
    'org.json.simple.JSONObject',

  ],

  imports: [
    'userDAO',
    'viewPIIRequestsDAO',
    'user'
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
        }
      ],
      javaCode: `
  
  // get valid PII request for current user
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  User user = (User) x.get("user");
  Sink sink = new ArraySink();
  sink = vprDAO.where(
    MLang.AND(
      MLang.EQ(ViewPIIRequests.CREATED_BY, user.getId() ),
      MLang.EQ(ViewPIIRequests.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
      MLang.GT(ViewPIIRequests.REQUEST_EXPIRES_AT , new Date() )
    )).select(sink);
  ArraySink a =  ((ArraySink) sink);
  ViewPIIRequests PIIRequest = (ViewPIIRequests) a.getArray().get(0);
  
  // Add current time to request and put back into DAO
  Date d = new Date();
  ArrayList downloadedAt =  PIIRequest.getDownloadedAt();
  downloadedAt.add(d);
  FObject clonedRequet = PIIRequest.fclone();
  clonedRequet.setProperty("downloadedAt", (Object) downloadedAt);
  vprDAO.put(clonedRequet);
  `
    }
  ],
});
