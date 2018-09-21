foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'FreezeApprovedPIIRequestsDAO',
  extends: 'foam.dao.ProxyDAO',


  imports: [
    'viewPIIRequestDAO',
    'user'
  ],

  documentation: `Prevents modification of approved PII requests. In the case
  that a request is still active, allow updating its downloadedAt property`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.security.PII.ViewPIIRequests'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject',
        }
      ],
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  User user = (User) x.get("user");
  
  // check if a request exists with same ID
  Sink sink = new ArraySink();
  sink = vprDAO.where(
      MLang.EQ(ViewPIIRequests.ID, obj.getProperty("id"))
    ).select(sink);
  List list = ((ArraySink) sink).getArray();
  
  // if the request is new, do nothing and pass to delegate  
  if ( list.size() == 0 ) {
    return getDelegate().put_(x, obj);
  }

  ViewPIIRequests piiRequestObject   = (ViewPIIRequests) list.get(0);
  
  // QUESTION - Why would we ever deny a request, and if we did, would it ever be necessary to reverse that?
  if ( piiRequestObject.getViewRequestStatus().equals(net.nanopay.security.PII.PIIRequestStatus.DENIED)){
    return null;
  }
  
  if ( piiRequestObject.getViewRequestStatus().equals(net.nanopay.security.PII.PIIRequestStatus.APPROVED)){
    // if PII request is not expired update the downloadedAt field
    if ( (piiRequestObject.getRequestExpiresAt()).compareTo(new Date()) > 0 ){
      ArrayList updatedDownloadedAt = (ArrayList)obj.getProperty("downloadedAt");
      FObject clonedRequest = piiRequestObject.fclone();
      clonedRequest.setProperty("downloadedAt", (Object) updatedDownloadedAt);
      return getDelegate().put_(x, clonedRequest);
    }
    // if the request is expired, prevent any modification to it
    return null;
  }
  // QUESTIONS - Should we be returning null here, or some kind of exception?
  return getDelegate().put_(x, obj);

  `
    },
  ]
});
