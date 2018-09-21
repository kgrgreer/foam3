foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'ApprovedPIIRequestDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'notificationDAO',
    'user'
  ],

  documentation: ` This decorator adds behaviour when the viewRequestStatus property of 
  the ViewPIIRequest model is set to approved. It is used in the PII system to hold logic
  that should be executed when a request is approved.`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.dao.Sink',
    'java.util.Calendar',
    'java.util.Date',
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

  if ( obj.getProperty("viewRequestStatus").equals(net.nanopay.security.PII.PIIRequestStatus.APPROVED)){
    if ( obj.getProperty("reportIssued").equals(false) ) {
      // set approvedBy and ApprovedAt
      // QUESTION - is the user we get here the correct one? 1348 vs 1
      obj.setProperty("ApprovedBy", ((User) getUser()).getId() );
      obj.setProperty("ApprovedAt", new Date());
      
      // set request approval and expiry time
      obj.setProperty("ApprovedAt", new Date());
      Calendar cal = Calendar.getInstance();
      cal.setTime(new Date());
      cal.add(Calendar.HOUR_OF_DAY, 48);
      obj.setProperty("requestExpiresAt", cal.getTime());
      
      // TODO - customize notification, including email name and body.
      foam.nanos.notification.Notification notification = new foam.nanos.notification.Notification();
      Long userID = Long.parseLong((obj.getProperty("createdBy")).toString());
      notification.setUserId(userID);
      notification.setBody("Your Personally Identifiable Information Report is now available");
      DAO notificationDAO = (DAO) getNotificationDAO();
      notificationDAO.put(notification);
    
      // set reportIssued model property to true 
      obj.setProperty("reportIssued", true);
    }
  }
  return getDelegate().put_(x, obj);
  `
    },
  ]
});

