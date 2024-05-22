/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// See: https://github.com/web-push-libs/webpush-java
foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'WebPushService',

  implements: [
    'foam.nanos.notification.push.PushService'
  ],

  javaImports: [
    'foam.dao.*',
    'foam.dao.ArraySink',
    'foam.nanos.auth.*',
    'java.util.List',
    'nl.martijndwars.webpush.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'apiKey'
    }
  ],

  methods: [
    {
      name: 'sendPushById',
      javaCode:
`
  System.err.println("Push to User: " + id);
  DAO userDAO = (DAO) getX().get("localUserDAO");
  User user = (User) userDAO.find(id);

  System.err.println("UserFound");

  sendPush(user, msg, data);

  return true;
`
},
    {
      name: 'sendPush',
      javaCode:
`
  if ( user == null ) {
    throw new RuntimeException("Invalid Parameters: Missing user");
  }

  System.err.println("Push to User: " + user);
  DAO pushRegistrationDAO = user.getPushRegistrations(getX());

  List subs = ((ArraySink) pushRegistrationDAO.select(new ArraySink())).getArray();

  for ( Object obj : subs ) {
    PushRegistration sub = (PushRegistration) obj;
    System.err.println("*********** sub");
  }

  /*
  PushService pushService = new PushService(...);
  Notification notification = new Notification(...);

  notification = new Notification(
      sub.getEndpoint(),
      sub.getUserPublicKey(),
      sub.getAuthAsBytes(),
      payload
    );

    pushService = new PushService();
    pushService.send(notification);
  */
  return true;
`
    }
  ]
});
