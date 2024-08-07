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
    'java.util.concurrent.ConcurrentLinkedQueue',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.HashSet',
    'org.json.JSONObject'
  ],

  properties: [
    {
      class: 'Map',
      name: 'whitelistCache',
      javaType: 'ConcurrentHashMap<String, HashSet<String>>',
      javaFactory: `
        return new ConcurrentHashMap<String, HashSet<String>>();
      `
    },
    {
      class: 'String',
      name: 'projectToken'
    },
    {
      class: 'Object',
      name: 'deliveryQueue',
      documentation: `
        sendMixpanelEvent pushes messages to queue for minutely
        cronjob to batch send to mixpanel
      `,
      javaType: 'ConcurrentLinkedQueue<JSONObject>',
      javaFactory: `
        return new ConcurrentLinkedQueue<JSONObject>();
      `
    },
    {
      class: 'Object',
      name: 'mixpanel',
      javaType: 'MixpanelAPI',
      javaFactory: `
        return new MixpanelAPI();
      `
    }
  ],

  methods: [
    {
      name: 'sendMixpanelEvent',
      args: 'X x, AnalyticEvent event, JSONObject props',
      documentation: `
        add event to deliveryqueue to be delivered by a cronjob
      `,
      javaCode: `
        if ( ! isWhitelisted(x, event) ) return;
        String trackingId = event.getSessionId();
        MessageBuilder messageBuilder = new MessageBuilder(getProjectToken());

        JSONObject sentEvent = messageBuilder.event(trackingId, event.getName(), props);

        put(sentEvent);
      `
    },
    {
      name: 'sendUserProperties',
      args: 'X x, User user, JSONObject props',
      javaCode: `
        String trackingId = user.getTrackingId();

        MessageBuilder messageBuilder = new MessageBuilder(getProjectToken());

        AuthService auth = (AuthService) x.get("auth");
        var isAdmin = user != null
          && (user.getId() == User.SYSTEM_USER_ID
          || user.getGroup().equals("admin")
          || user.getGroup().equals("system"));
        var isAnonymous = user != null && auth.isUserAnonymous(x, user.getId());

        if ( ! isAdmin && ! isAnonymous ) {
          JSONObject updateProfile = messageBuilder.set(trackingId, props);

          try {
            getMixpanel().sendMessage(updateProfile);
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
        var whitelist = getWhitelistCache().get(spid);
        if ( whitelist == null ) {
          var spidObj = (ServiceProvider) ((DAO) x.get("serviceProviderDAO")).find(spid);
          if ( spidObj.getMixpanelWhitelist() == null ) return false;
          whitelist = new HashSet<String>(Arrays.asList(spidObj.getMixpanelWhitelist()));
          getWhitelistCache().put(spid, whitelist);
        }
        return whitelist.contains(event.getName());
      `
    },
    {
      name: 'put',
      documentation: `add message to deliveryqueue`,
      args: 'JSONObject message',
      javaCode: `
        getDeliveryQueue().add(message);
      `
    },
    {
      name: 'deliver',
      args: 'X x',
      documentation: `batch deliver all messages in queue, called from cronjob`,
      javaCode: `
        var counter = getDeliveryQueue().size();
        int messageCount = 0;
        try {
          ClientDelivery clientDelivery = new ClientDelivery();
          JSONObject message = null;
          while ( counter > 0 ) {
            // add Messages
            message = getDeliveryQueue().poll();
            if ( message != null && clientDelivery.isValidMessage(message) ) {
              messageCount++;
              counter--;
              clientDelivery.addMessage(message);
            } else {
              Loggers.logger(x, this).error("Invalid mixpanel message:", message.toString());
            }
          }
          if ( messageCount > 0 ) getMixpanel().deliver(clientDelivery);
          Loggers.logger(x, this).info("Delivered", messageCount, " messages to mixpanel");
        } catch (IOException e) {
          Loggers.logger(x, this).error("Can't communicate with Mixpanel.", e.getMessage());
        }
      `
    }
  ]
});
