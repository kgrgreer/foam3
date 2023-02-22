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
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.lib.json.Outputter',
    'foam.util.SafetyUtil',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpResponse',
    'java.io.PrintWriter',
    'java.io.StringWriter',
    'java.util.HashMap',
    'java.util.Map',
    'java.net.URI'
  ],

  methods: [
    {
      name: 'sendNotification',
      javaCode: `
      try {
        if ( foam.util.SafetyUtil.isEmpty(notification.getGoogleChatWebhook()) )
          return;

        Map map = new HashMap();

        String URL = notification.getGoogleChatWebhook();
        // Loggers.logger(x, this).debug("URL", URL);

        if ( notification.getAlarm() != null ) {
          StringBuilder threadKey = new StringBuilder();
          threadKey.append(System.getProperty("CLUSTER_NAME", notification.getAlarm().getHostname()));
          threadKey.append("-");
          threadKey.append(notification.getAlarm().getName().replaceAll(" ", "_"));
          if ( ! SafetyUtil.isEmpty(notification.getAlarm().getExternalId()) ) {
            threadKey.append("-");
            threadKey.append(notification.getAlarm().getExternalId());
          }
          Map thread = new HashMap();
          thread.put("threadKey", threadKey.toString());
          map.put("thread", thread);
          URL += "&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD";
        }

        String message = notification.getGoogleChatMessage();
        if ( foam.util.SafetyUtil.isEmpty(message) ) {
          message = notification.getBody();
        }

        StringWriter sw  = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        Outputter outputter = new Outputter(x, pw);
        map.put("text", message);
        outputter.output(map);
        String body = sw.toString();
        // Loggers.logger(x, this).debug("body", body);

        HttpRequest request = HttpRequest.newBuilder(URI.create(URL))
          .header("accept", "application/json; charset=UTF-8")
          .POST(HttpRequest.BodyPublishers.ofString(body))
          .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
          .send(request, HttpResponse.BodyHandlers.ofString());

        // Loggers.logger(x, this).debug(response.body());
        if ( response.statusCode() != 200 ) {
          Loggers.logger(x, this).warning("Failed posting to Google", response.statusCode(), response.body(), "message", message);
        }
      } catch (Throwable t) {
        Loggers.logger(x, this).error(t);
      }
      `
    }
  ]
});
