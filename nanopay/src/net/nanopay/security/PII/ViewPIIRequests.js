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
    'org.json.simple.JSONObject'
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
      name: 'reportIssued',
      class: 'Boolean',
      value: false
    },
    {
      name: 'viewRequestStatus',
      class: 'Enum',
      of: 'net.nanopay.security.PII.PIIRequestStatus',
      javaPostSet: `
      if ( viewRequestStatus_.equals(net.nanopay.security.PII.PIIRequestStatus.APPROVED) && !getReportIssued() ) {
        // generate the report
        net.nanopay.security.PII.PIIReportGenerator reportGenerator = new net.nanopay.security.PII.PIIReportGenerator();
        JSONObject JSONBlob = reportGenerator.getPIIData(x_, getCreatedBy());
        System.out.println(JSONBlob);

        // generate a notification and email
        foam.nanos.notification.Notification notification = new foam.nanos.notification.Notification();
        notification.setEmailIsEnabled(true);
        notification.setUserId(getCreatedBy());
        notification.setEmailName("PII-Report");
        notification.getEmailArgs().put("info", JSONBlob);
        notification.setBody("Your Personally Identifiable Information Report is ready, and your PII as stored with nanopay is as follows - \\n" + JSONBlob.toString());
        DAO notificationDAO = (DAO) getNotificationDAO();
        notificationDAO.put(notification);

        
        // TODO: set enum to readonly
        


        setReportIssued(true);
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
    }
  ]
});
