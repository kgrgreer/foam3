/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'FreezeApprovedPIIRequestsDAO',
  extends: 'foam.dao.ProxyDAO',


  imports: [
    'viewPIIRequestDAO',
    'user'
  ],

  documentation: ` `,

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
      documentation: `Prevents the modification of a request if it has already been approved`,
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

  ViewPIIRequests PIIRequestObject   = (ViewPIIRequests) list.get(0);
  
  // QUESTION - Why would we ever deny a request, and if we did, would it ever be necessary to reverse that?
  if ( PIIRequestObject.getViewRequestStatus().equals(net.nanopay.security.PII.PIIRequestStatus.DENIED)){
    return null;
  }
  
  if ( PIIRequestObject.getViewRequestStatus().equals(net.nanopay.security.PII.PIIRequestStatus.APPROVED)){
    // if PII request is not expired update the downloadedAt field
    if ( (PIIRequestObject.getRequestExpiresAt()).compareTo(new Date()) > 0 ){
      ArrayList updatedDownloadedAt = (ArrayList)obj.getProperty("downloadedAt");
      FObject clonedRequest = PIIRequestObject.fclone();
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
