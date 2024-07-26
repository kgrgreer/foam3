/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'CreateMixpanelProfileAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],
  documentation: `
    On user put, if user cannot be found with trackingId matching analytic event
    sessionID, create a new mixpanel profile with the sessionID
  `,

  javaImports: [
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',
    'foam.net.IPSupport',
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
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            String trackingId = user.getTrackingId();

            MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
            MixpanelAPI mixpanel = new MixpanelAPI();

            // create user profile
            AuthService auth = (AuthService) x.get("auth");
            var isAdmin = user != null
                && (user.getId() == User.SYSTEM_USER_ID
                || user.getGroup().equals("admin")
                || user.getGroup().equals("system"));
            var isAnonymous = user != null && auth.isUserAnonymous(x, user.getId());

            if ( ! isAdmin && ! isAnonymous ) {
              JSONObject userProps = new JSONObject();
              userProps.put("$id", user.getId());
              userProps.put("$user_name", user.getUserName());
              userProps.put("$ip", IPSupport.instance().getRemoteIp(x));
              JSONObject createProfile = messageBuilder.set(trackingId, userProps);

              try {
                mixpanel.sendMessage(createProfile);
              } catch (IOException e) {
                Loggers.logger(x, this).error("Failed sending user data:", user.getId(), "Can't communicate with Mixpanel");
              }
            }
          }
        }, "Create Mixpanel profile");
      `
    }// this is not sending
  ]
});
