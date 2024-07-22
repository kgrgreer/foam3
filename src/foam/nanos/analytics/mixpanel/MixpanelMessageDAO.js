/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'MixpanelMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'com.mixpanel.mixpanelapi.ClientDelivery',
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',

    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',

    'java.io.IOException',

    'org.json.JSONObject'
  ],

  constants: [
    {
      type: 'String',
      name: 'PROJECT_TOKEN',
      value: '2cf01d4604ecf0ba8038c7034fe7851d'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        AnalyticEvent event = (AnalyticEvent) super.put_(x, obj);
        Session session = (Session) ((DAO) x.get("sessionDAO")).find(event.getSessionId());

        MessageBuilder messageBuilder = new MessageBuilder(this.PROJECT_TOKEN);
        MixpanelAPI mixpanel = new MixpanelAPI();

        // set user
        AuthService auth = (AuthService) x.get("auth");
        User user = session.findUserId(x);
        var isAdmin = user != null
            && (user.getId() == User.SYSTEM_USER_ID
            || user.getGroup().equals("admin")
            || user.getGroup().equals("system"));
        var isAnonymous = user != null && auth.isUserAnonymous(x, user.getId());

        String trackingId = session.getId();
        if ( user != null && ! isAdmin && ! isAnonymous ) {
          JSONObject userProps = new JSONObject();
          userProps.put("$id", trackingId);
          userProps.put("$email", user.getEmail());
          userProps.put("$userId", user.getId());
          JSONObject update = messageBuilder.set(Long.toString(user.getId()), userProps);

          try {
            mixpanel.sendMessage(update);
          } catch (IOException e) {
            Loggers.logger(x, this).error("Failed sending user data:", event.getId(), "Can't communicate with Mixpanel");
          }
        }

        // build message
        // var distinctId = SafetyUtil.isEmpty(trackingId) ? session.getId() : trackingId;
        messageBuilder = new MessageBuilder(this.PROJECT_TOKEN);
        JSONObject props = new JSONObject(event.toJSON());
        props.put("sessionId", session.getId());
        JSONObject sentEvent = messageBuilder.event(trackingId, event.getName(), props);

        ClientDelivery delivery = new ClientDelivery();
        delivery.addMessage(sentEvent);

        try {
          mixpanel.deliver(delivery);
        } catch (IOException e) {
          Loggers.logger(x, this).error("Failed sending analyticEvent:", event.getId(), "Can't communicate with Mixpanel");
        }
        return event;
      `
    }
  ]
});