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
  name: 'PreventDuplicatePIIRequestsDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'viewPIIRequestDAO',
    'user'
  ],

  documentation: `Prevents a new request being put to the dao if
  there is already an active request assosciated with the user`,

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'java.util.Date',

    'net.nanopay.security.pii.ViewPIIRequest'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestDAO");
  User user = ((Subject) x.get("subject")).getUser();

  if ( obj.getProperty("viewRequestStatus").equals(net.nanopay.security.pii.PIIRequestStatus.PENDING)){
    // get pending or valid and approved PII requests for current user
    Count count = (Count) vprDAO.where(
      MLang.OR(
        (MLang.AND(
          MLang.EQ(ViewPIIRequest.CREATED_BY, user.getId() ),
          MLang.EQ(ViewPIIRequest.VIEW_REQUEST_STATUS, PIIRequestStatus.PENDING))
        ),
        (MLang.AND(
          MLang.EQ(ViewPIIRequest.CREATED_BY, user.getId() ),
          MLang.EQ(ViewPIIRequest.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
          MLang.GT(ViewPIIRequest.REQUEST_EXPIRES_AT , new Date() ))
        )
      )
    ).select(new Count());

    if ( count.getValue() > 0 ) {
      return null;
    }
  }
  return getDelegate().put_(x, obj);
  `
    },
  ]
});
