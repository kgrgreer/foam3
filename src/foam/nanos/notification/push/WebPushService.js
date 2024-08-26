/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// See: https://github.com/web-push-libs/webpush-java
//
// To generate public/private keys:
// npm install web-push --save
// ./node_modules2/.bin/web-push generate-vapid-keys --json

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
    'java.util.HashMap',
    'nl.martijndwars.webpush.Notification',
    'org.bouncycastle.jce.provider.BouncyCastleProvider',
    'foam.nanos.notification.push.iOSNativePushRegistration',
    'foam.nanos.notification.push.APNSPushService'
  ],

  properties: [
    {
      class: 'String',
      name: 'supportEmail',
      javaPostSet: 'clearPushService();'
    },
    // TODO: move to KeyPairDAO
    {
      class: 'String',
      name: 'publicKey',
      javaPostSet: 'clearPushService();'
    },
    {
      class: 'String',
      name: 'privateKey',
      javaPostSet: 'clearPushService();'
    },
    {
      class: 'Object',
      of: 'nl.martijndwars.webpush.PushService',
      name: 'pushService',
      transient: true,
      javaFactory: `
      // TODO: rebuild if settings change
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

        sendPush(user, title, body);

        return true;
      `
    },
    {
      name: 'sendPush',
      javaCode:
      `
      if ( user == null || title.isEmpty() ) {
        throw new RuntimeException("Invalid Parameters: Missing user or title"); 
      }

        getPushService();

        System.err.println("Push to User: " + user.getId());
        DAO pushRegistrationDAO = user.getPushRegistrations(getX());

        List   subs = ((ArraySink) pushRegistrationDAO.select(new ArraySink())).getArray();
        HashMap msgMap = new HashMap<String, String>()
          {
              {
                  put("title", title);
                  put("body", body);
              }
          };

        for ( Object obj : subs ) {
          PushRegistration sub = (PushRegistration) obj;
          send(sub, msgMap);
        }

        return true;
      `
    },
    {
      name: 'send',
      args: 'PushRegistration sub, HashMap msgMap',
      type: 'Void',
      javaCode: `
      /*
      System.err.println("  Sending:    " + msg);
      System.err.println("    endpoint: " + sub.getEndpoint());
      System.err.println("         key: " + sub.getKey());
      System.err.println("        auth: " + sub.getAuth());
      */
        try {
          if ( sub instanceof foam.nanos.notification.push.iOSNativePushRegistration ) {
            APNSPushService APNSpushService = (APNSPushService) getX().get("APNSpushService");
            if ( APNSpushService == null ) {
              throw new RuntimeException("Missing Apple Push Notification Service in Context");
            }
            APNSpushService.send((iOSNativePushRegistration) sub, msgMap);
          } else { 
            String msg  = "{\\"title\\":\\"" + msgMap.get("title") + "\\",\\"body\\":\\"" + msgMap.get("body") + "\\"}";
            Notification n = new Notification(
              sub.getEndpoint(),
              sub.getKey(),  // sub.getUserPublicKey(),
              sub.getAuth(), // sub.getAuthAsBytes(),
              msg
            );

            ((nl.martijndwars.webpush.PushService) getPushService()).sendAsync(n);
          }
        } catch (Throwable t) {
          //TODO: add alarm
          t.printStackTrace();
        }
      `
    }
  ]
});
