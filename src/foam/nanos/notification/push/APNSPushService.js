/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'APNSPushService',

  documentation: `Not called directly, rather called through WebPushService`,

  implements: [
    'foam.nanos.notification.push.PushService'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.*',
    'foam.dao.ArraySink',
    'foam.nanos.auth.*',
    'foam.box.socket.SslContextFactory',
    'foam.nanos.logger.Loggers',
    'foam.mlang.MLang',
    'java.security.Security',
    'java.util.List',
    'javax.net.ssl.SSLParameters',
    'com.eatthepath.pushy'
  ],

  // axioms: [
  //   {
  //     name: 'javaExtras',
  //     buildJavaClass: function(cls) {
  //       cls.methods.push(`
  //         APNSCredential cred = (APNSCredential) getCredentials(getX(), (String) getX().get(";spid"));
  //         final ApnsClient apnsClient = new ApnsClientBuilder()
  //           .setApnsServer(ApnsClientBuilder.DEVELOPMENT_APNS_HOST)
  //           .setClientCredentials(new File("/images/a1.cer"),new File("/images/key.pem"), "")
  //           .build();

  //         final ApnsPayloadBuilder payloadBuilder = new SimpleApnsPayloadBuilder();
  //         payloadBuilder.setAlertBody("Example!");

  //         final String payload = payloadBuilder.build();
  //         final String token = TokenUtil.sanitizeTokenString("<efc7492 bdbd8209>");

  //         pushNotification = new SimpleApnsPushNotification(token, "com.example.myApp", payload);
  //       `);
  //     }
  //   }
  // ],

  methods: [
    {
      name: 'sendPushById',
      javaCode:
      `
        //NO-OP
        return false;
      `
    },
    {
      name: 'sendPush',
      javaCode:
      `
        //NO-OP
        return false;
      `
    },
    {
      name: 'send',
      args: 'iOSNativePushRegistration sub, String msg',
      type: 'Void',
      javaCode: `
        try {
          System.err.println("****APNS CALLED, msg");
          
          // Contact APNS and request a notification
        } catch (Throwable t) {
          throw t;
        }
      `
    },
    // {
    //   name: 'getCredentials',
    //   args: 'X x, String spid',
    //   type: 'APNSCredential',
    //   javaCode: `
    //     APNSCredential credentials = null;
    //     DAO credentialDAO = (DAO) x.get("credentialsDAO");
    //     ArraySink arraySink = new ArraySink();
    //     credentialDAO.where(MLang.EQ(APNSCredential.SPID, spid)).select(arraySink);
    //     if ( arraySink.getArray().size() > 0 ) {
    //       credentials = (APNSCredential) (arraySink.getArray()).get(0);
    //     }
    //     return credentials;
    //   `
    // }
    // {
    //   name: 'makeHTTPRequest',
    //   args: 'iOSNativePushRegistration sub, String msg',
    //   type: 'Void',
    //   javaCode: `
    //   `
    // },
    // {
    //   name: 'getHTTPHeaders',
    //   args: '',
    //   type: 'Void',
    //   javaCode: `
    //   `
    // }
  ]
});
