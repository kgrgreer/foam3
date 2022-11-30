/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'GoogleChatSetting',
  extends: 'foam.nanos.notification.NotificationSetting',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'org.apache.http.client.methods.CloseableHttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients'
  ],

  methods: [
    {
      name: 'sendNotification',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        if ( foam.util.SafetyUtil.isEmpty(notification.getGoogleChatWebhook()) )
          return;

        // Get the message to send
        String googleChatMessage = notification.getGoogleChatMessage();
        if ( foam.util.SafetyUtil.isEmpty(googleChatMessage) ) {
          googleChatMessage = notification.getBody();
        }

        // Post to the GoogleChat webhook
        HttpPost httpPost = new HttpPost(notification.getGoogleChatWebhook());
        httpPost.addHeader("Content-type", "application/json");

        // Add the googleChat message to the post
        Theme theme = ((Themes) x.get("themes")).findTheme(x);
        String appName = getSpid();
        if ( theme != null &&
             ! foam.util.SafetyUtil.isEmpty(theme.getAppName()) ) {
          appName = theme.getAppName();
        }
        StringEntity params = new StringEntity(appName +" Alarm: "+googleChatMessage , "UTF-8");
        params.setContentType("application/json");
        httpPost.setEntity(params);

        try {
          CloseableHttpResponse response =  HttpClients.createDefault().execute(httpPost);

          if ( response.getStatusLine().getStatusCode() != 200 )
            logger.warning("Could not post to GoogleChat; error code - " + response.getStatusLine().getStatusCode());
        } catch (Throwable t) {
          logger.error("Error sending GoogleChat message: ", t);
        }
      `
    }
  ]
});
