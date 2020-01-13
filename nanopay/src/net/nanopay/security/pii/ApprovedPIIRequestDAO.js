foam.CLASS({
  package: 'net.nanopay.security.pii',
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
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'java.util.Calendar',
    'java.util.Date',
    'net.nanopay.security.pii.ViewPIIRequest'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
  if ( obj.getProperty("viewRequestStatus").equals(net.nanopay.security.pii.PIIRequestStatus.APPROVED)){
    if ( obj.getProperty("reportIssued").equals(false) ) {
      // set approvedBy and ApprovedAt
      obj.setProperty("approvedBy", ((User) x.get("user")).getId() );
      obj.setProperty("approvedAt", new Date());
      
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

