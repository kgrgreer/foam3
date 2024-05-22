/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistryService',
  implements: [ 'foam.nanos.notification.push.PushRegistry' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'subscribe',
//      type: 'Void',
//      args: 'Context x, String sub, String endpoint, String key, String auth'
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) throw new IllegalArgumentException("Missing user.");

        PushRegistration r = new PushRegistration();
        r.setUser(user.getId());
        r.setSubscription(sub);
        r.setEndpoint(endpoint);
        r.setKey(key);
        r.setAuth(auth);
        DAO dao = (DAO) x.get("pushRegistrationDAO");
        dao.put(r);
      `
    }
  ]
});
