/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'MixpanelService',

  javaImports: [
    'com.mixpanel.mixpanelapi.ClientDelivery',
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',

    'foam.core.ContextAwareSupport',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.analytics.AnalyticEvent',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
    'foam.nanos.NanoService',

    'java.io.IOException',
    'java.util.Arrays',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.HashSet'
  ],

  properties: [
    {
      class: 'Map',
      name: 'whitelistCache',
      javaType: 'Map<String, HashSet<String>>',
      javaFactory: `
        return new ConcurrentHashMap<String, HashSet<String>>();
      `
    },
    {
      class: 'String',
      name: 'projectToken'
    }
  ],

  methods: [
    {
      name: 'sendMixpanelEvent',
      args: 'X x, AnalyticEvent event, JSONObject props',
      javaCode: `
        if ( ! isWhitelisted(x, event) ) return;
        String trackingId = event.getSessionId();
        MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
        MixpanelAPI mixpanel = new MixpanelAPI();

        JSONObject sentEvent = messageBuilder.event(trackingId, event.getName(), props);

        ClientDelivery delivery = new ClientDelivery();
        delivery.addMessage(sentEvent);
        try {
          mixpanel.deliver(delivery);
        } catch (IOException e) {
          Loggers.logger(x, this).error("Failed sending analyticEvent:", event.getId(), "Can't communicate with Mixpanel");
        }
      `
    },
    {
      name: 'sendUserProperties',
      args: 'X x, User user, JSONObject props',
      javaCode: `
        String trackingId = user.getTrackingId();

        MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
        MixpanelAPI mixpanel = new MixpanelAPI();

        AuthService auth = (AuthService) x.get("auth");
        var isAdmin = user != null
          && (user.getId() == User.SYSTEM_USER_ID
          || user.getGroup().equals("admin")
          || user.getGroup().equals("system"));
        var isAnonymous = user != null && auth.isUserAnonymous(x, user.getId());

        if ( ! isAdmin && ! isAnonymous ) {
          JSONObject updateProfile = messageBuilder.set(trackingId, props);

          try {
            mixpanel.sendMessage(updateProfile);
          } catch (IOException e) {
            Loggers.logger(x, this).error("Failed sending user data:", user.getId(), "Can't communicate with Mixpanel");
          }
        }
      `
    },
    {
      name: 'isWhitelisted',
      args: 'X x, AnalyticEvent event',
      javaType: 'Boolean',
      javaCode: `
        var spid = (String) x.get("spid");
        var whitelist = whitelistCache_.get(spid);
        if ( whitelist == null ) {
          var spidObj = (ServiceProvider) ((DAO) x.get("serviceProviderDAO")).find(spid);
          if ( spidObj.getMixpanelWhitelist() == null ) return false;
          whitelist = new HashSet<String>(Arrays.asList(spidObj.getMixpanelWhitelist()));
          whitelistCache_.put(spid, whitelist);
        }
        return whitelist.contains(event.getName());
      `
    }
  ]
});
