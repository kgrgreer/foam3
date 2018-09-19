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
    'foam.dao.DAO',
    'foam.dao.Sink',
    'net.nanopay.security.PII.ViewPIIRequests',
    'java.util.Calendar',
    'java.util.Date',
    'foam.nanos.notification.Notification',
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'foam.mlang.MLang',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.core.FObject',
    'foam.mlang.sink.Count'
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

  // if the request is new, pass to delegate  
  if ( (Long) obj.getProperty("id") == 0l ) {
    return getDelegate().put_(x, obj);
  }

  // for requests being modified, check their previous status
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  User user = (User) x.get("user");
  Sink sink = new ArraySink();
  sink = vprDAO.where(
      MLang.EQ(ViewPIIRequests.ID, obj.getProperty("id"))
    ).select(sink);

  ArraySink a =  (ArraySink) sink;
  ViewPIIRequests PIIRequestObject   = (ViewPIIRequests) a.getArray().get(0);
  
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
  
  return getDelegate().put_(x, obj);

  `
    },
  ]
});
