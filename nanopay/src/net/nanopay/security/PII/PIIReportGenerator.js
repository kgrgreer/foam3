foam.CLASS({
  package: 'net.nanopay.security.pii',
  implements: [
    'net.nanopay.security.pii.PII'
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
    'net.nanopay.security.pii.ViewPIIRequests',
    'net.nanopay.security.pii.PIIRequestStatus',
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
      documentation: `return a JSON Object with keys as User property which are flagged as containing PII,
      and values as the values of those properties for the user`,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'id',
          class: 'Long'
        }
      ],
      javaReturns: 'JSONObject',
      javaCode:
        `
  // Find the user
  DAO userDAO = (DAO) x.get("userDAO");
  User user = (User) userDAO.find_(x, id );
  
  // Initialize JSONObject
  JSONObject jsonObject = new JSONObject();

  // Iterate through properties of User
  List axioms = foam.nanos.auth.User.getOwnClassInfo().getAxioms();
  for (Object propertyObject : axioms) {
    foam.core.PropertyInfo property = (foam.core.PropertyInfo) propertyObject;
    if ( property.containsPII() ) {
      try {
        // add keypair entry to jsonObject
        jsonObject.put(property.getName() , property.get(user).toString());
      } catch (Exception e) {
        // ignore cases in which values are not populated or null
        ; 
      }
    }      
    }           
  return jsonObject;
      `
    },
    {
      name: 'addTimeToPIIRequest',
      documentation: `clones a PIIRequest and adds the current date to the DownloadedAt Array and puts 
      it back to the dao `,
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode: `
      
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  User user = (User) x.get("user");
  
  Sink sink = new ArraySink();
  
  // get valid PII request object for current user 
  sink = vprDAO.where(
  MLang.AND(
    MLang.EQ(ViewPIIRequests.CREATED_BY, user.getId() ),
    MLang.EQ(ViewPIIRequests.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
    MLang.GT(ViewPIIRequests.REQUEST_EXPIRES_AT , new Date() )
  )).select(sink);
  
  ArraySink a =  (ArraySink) sink;
  ViewPIIRequests piiRequestObject = (ViewPIIRequests) a.getArray().get(0);
  
    
  // Clone object and append current dateTime to its DownloadedAt array prop
  FObject clonedRequest = piiRequestObject.fclone();
  ArrayList cloneDownloadedAt =  piiRequestObject.getDownloadedAt();
  cloneDownloadedAt.add(new Date());

  // Update the clonedRequest and put to DAO
  clonedRequest.setProperty("downloadedAt", (Object) cloneDownloadedAt);
  vprDAO.put(clonedRequest);
  `
    }
  ],
});
