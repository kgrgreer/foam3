foam.CLASS({
  package: 'net.nanopay.security.pii',
  name: 'PIIReportGenerator',
  implements: [
    'net.nanopay.security.pii.PII'
  ],
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
    'net.nanopay.security.pii.ViewPIIRequest',
    'net.nanopay.security.pii.PIIRequestStatus',
    'net.nanopay.security.pii.PIIOutputter',
    'org.json.simple.JSONObject',

  ],

  imports: [
    'userDAO',
    'viewPIIRequestDAO',
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
      javaReturns: 'String',
      javaCode:
        `
  DAO userDAO = (DAO) x.get("userDAO");
  User user = (User) userDAO.find_(x, id );
  PIIOutputter piiOutputter = new PIIOutputter();
  return (piiOutputter.stringify(user));
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
      
  DAO vprDAO = (DAO) x.get("viewPIIRequestDAO");
  User user = (User) x.get("user");
  
  Sink sink = new ArraySink();
  
  // get valid PII request object for current user 
  sink = vprDAO.where(
  MLang.AND(
    MLang.EQ(ViewPIIRequest.CREATED_BY, user.getId() ),
    MLang.EQ(ViewPIIRequest.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
    MLang.GT(ViewPIIRequest.REQUEST_EXPIRES_AT , new Date() )
  )).select(sink);
  
  ArraySink a =  (ArraySink) sink;
  ViewPIIRequest piiRequestObject = (ViewPIIRequest) a.getArray().get(0);
  
    
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
