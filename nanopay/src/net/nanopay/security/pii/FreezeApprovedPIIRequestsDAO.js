/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security.pii',
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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',

    'net.nanopay.security.pii.ViewPIIRequest'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestDAO");
  User user = ((Subject) x.get("subject")).getUser();

  // check if a request exists with same ID
  Sink sink = new ArraySink();
  sink = vprDAO.where(
      MLang.EQ(ViewPIIRequest.ID, obj.getProperty("id"))
    ).select(sink);
  List list = ((ArraySink) sink).getArray();

  // if the request is new, do nothing and pass to delegate
  if ( list.size() == 0 ) {
    return getDelegate().put_(x, obj);
  }

  ViewPIIRequest piiRequestObject   = (ViewPIIRequest) list.get(0);

  // TODO - resolve question of why would we ever deny a request, and if we did, would it ever be necessary to reverse that?
  if ( piiRequestObject.getViewRequestStatus().equals(net.nanopay.security.pii.PIIRequestStatus.DENIED)){
    return null;
  }

  if ( piiRequestObject.getViewRequestStatus().equals(net.nanopay.security.pii.PIIRequestStatus.APPROVED)){
    // if PII request is not expired update the downloadedAt field
    if ( (piiRequestObject.getRequestExpiresAt()).compareTo(new Date()) > 0 ){
      ArrayList updatedDownloadedAt = (ArrayList)obj.getProperty("downloadedAt");
      FObject clonedRequest = piiRequestObject.fclone();
      clonedRequest.setProperty("downloadedAt", (Object) updatedDownloadedAt);
      return getDelegate().put_(x, clonedRequest);
    }
    // if the request is expired, prevent any modification to it
    throw new RuntimeException("Cannot modify an expired request");
  }
  // QUESTIONS - Should we be returning null here, or some kind of exception?
  return getDelegate().put_(x, obj);

  `
    },
  ]
});
