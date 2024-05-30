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
    'java.security.Security',
    'foam.dao.*',
    'foam.dao.ArraySink',
    'foam.nanos.auth.*',
    'java.util.List',
    'nl.martijndwars.webpush.Notification',
    'org.bouncycastle.jce.provider.BouncyCastleProvider'
  ],

  properties: [
    {
      class: 'String',
      name: 'supportEmail',
      required: true
    },
    {
      class: 'String',
      name: 'publicKey',
      required: true
    },
    {
      class: 'String',
      name: 'privateKey',
      required: true
    },
    {
      class: 'Object',
      of: 'nl.martijndwars.webpush.PushService',
      name: 'pushService',
      transient: true,
      javaFactory: `
      try {
        if ( Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null ) {
          Security.addProvider(new BouncyCastleProvider());
        }
        return new nl.martijndwars.webpush.PushService(getPublicKey(), getPrivateKey(), "mailto:" + getSupportEmail() );
      } catch (Throwable t) {
        t.printStackTrace();
        return null;
      }
      `
    }
  ],

  methods: [
    {
      name: 'sendPushById',
      javaCode:
`
  System.err.println("Push to User: " + id);
  DAO  userDAO = (DAO) getX().get("localUserDAO");
  User user    = (User) userDAO.find(id);

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

  getPushService();

  System.err.println("Push to User: " + user.getId());
  DAO pushRegistrationDAO = user.getPushRegistrations(getX());

  List subs = ((ArraySink) pushRegistrationDAO.select(new ArraySink())).getArray();

  for ( Object obj : subs ) {
    PushRegistration sub = (PushRegistration) obj;
    send(sub, msg);
  }

  return true;
`
    },
    {
      name: 'send',
      args: 'PushRegistration sub, String msg',
      type: 'Void',
      javaCode: `
      /*
      System.err.println("  Sending:    " + msg);
      System.err.println("    endpoint: " + sub.getEndpoint());
      System.err.println("         key: " + sub.getKey());
      System.err.println("        auth: " + sub.getAuth());
      */
        try {
          Notification n = new Notification(
            sub.getEndpoint(),
            sub.getKey(),  // sub.getUserPublicKey(),
            sub.getAuth(), // sub.getAuthAsBytes(),
            msg
          );

          ((nl.martijndwars.webpush.PushService) getPushService()).sendAsync(n);
        } catch (Throwable t) {
          t.printStackTrace();
        }
      `
    }
  ]
});
