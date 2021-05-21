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
  name: 'ApprovedPIIRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ` This decorator adds behaviour when the viewRequestStatus property of 
  the ViewPIIRequest model is set to approved. It is used in the PII system to hold logic
  that should be executed when a request is approved.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'java.util.Calendar',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj.getProperty("viewRequestStatus").equals(net.nanopay.security.pii.PIIRequestStatus.APPROVED)){
          if ( obj.getProperty("reportIssued").equals(false) ) {
            // set approvedBy and ApprovedAt
            obj.setProperty("approvedBy", ((Subject) x.get("subject")).getUser().getId() );
            obj.setProperty("approvedAt", new Date());
            
            Calendar cal = Calendar.getInstance();
            cal.setTime(new Date());
            cal.add(Calendar.HOUR_OF_DAY, 48);
            obj.setProperty("requestExpiresAt", cal.getTime());
            
            Notification notification = new Notification();
            notification.setBody("Your Personally Identifiable Information Report is now available");
            
            Long userId = Long.parseLong((obj.getProperty("createdBy")).toString());
            DAO userDAO = (DAO) x.get("localUserDAO");
            User user = (User) userDAO.find(userId);
            if ( user != null ) {
              user.doNotify(x, notification);
            }
            
            // set reportIssued model property to true 
            obj.setProperty("reportIssued", true);
          }
        }
        return getDelegate().put_(x, obj);
      `
    },
  ]
});

