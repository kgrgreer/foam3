foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'ViewPIIRequests',

  documentation: `Modelled PII Request`,

  imports: [
    'notificationDAO'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.security.PII.PIIReportGenerator',
    'foam.nanos.notification.Notification',
    'org.json.simple.JSONObject',
    'java.util.Calendar',
    'java.util.Date'
    ],

  searchColumns: [
    'viewRequestStatus'
   ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the request'
    },
    {
      name: 'created',
      class: 'DateTime',
    },
    {
      name: 'viewRequestStatus',
      class: 'Enum',
      of: 'net.nanopay.security.PII.PIIRequestStatus',
      javaPostSet: `
      if ( viewRequestStatus_.equals(net.nanopay.security.PII.PIIRequestStatus.APPROVED)) {

        // set expiry time
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date()); 
        cal.add(Calendar.HOUR_OF_DAY, 48);
        setRequestExpiresAt(cal.getTime());

        // TODO: set enum to readonly

        // generate a notification
        // foam.nanos.notification.Notification notification = new foam.nanos.notification.Notification();
        // notification.setEmailIsEnabled(true);
        // notification.setUserId(getCreatedBy());
        // notification.setBody("Your Personally Identifiable Information Report is now available");
        // DAO notificationDAO = (DAO) getNotificationDAO();
        // notificationDAO.put(notification);
      };
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: 'Placeholder for reviewer'
    },
    {
      name: 'lastModified',
      class: 'DateTime',
      documentation: 'Placeholder for reviwedAt'
    },
    {
      name: 'requestExpiresAt',
      class: 'DateTime',
      documentation: 'Placeholder for reviwedAt'
    }
  ]
});
