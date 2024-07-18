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
    'foam.mlang.MLang',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.AuthService',
    'foam.nanos.notification.push.iOSNativePushRegistration',
    'foam.nanos.session.Session'
  ],

  methods: [
    {
      name: 'subscribe',
//      type: 'Void',
//      args: 'Context x, String sub, String endpoint, String key, String auth, String token'
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        if ( user == null ) throw new IllegalArgumentException("Missing user.");
        PushRegistration r;
        if ( token == null ) {
          r = new PushRegistration();
          r.setEndpoint(endpoint);
          r.setKey(key);
          r.setAuth(auth);
        } else {
          iOSNativePushRegistration ir =  (iOSNativePushRegistration) new iOSNativePushRegistration();
          ir.setEndpoint(token);
          r = ir;
        }
        r.setLastKnownState(currentState);
        Session session = x.get(Session.class);
        if ( session != null ) r.setSession(session.getId());

        // Check if this entry exists in dao and belongs to a real user, if yes, dont override;
        // Otherwise we lose the user's endpoint every time they sign out
        DAO dao = (DAO) x.get("pushRegistrationDAO");
        boolean isAnonymous = ((AuthService) x.get("auth")).isAnonymous(x);
        if ( isAnonymous ) {
          PushRegistration p = (PushRegistration) dao.find(r.getEndpoint());
          if ( p != null && p.getUser() != user.getId() ) {
            return;
          }
        }

        // Possible issue: User A signs in and gets access to notifications then user B signs in and gets access to notifications. 
        // Now device owner can see user B's notifications till they sign in themselves

        r.setUser(user.getId());
        dao.put(r);
      `
    },
    {
      name: 'updatePermissionState',
      // type: 'Void',
      // args: 'Context x, String state',
      javaCode: `
        DAO dao = (DAO) x.get("pushRegistrationDAO");
        Session session = x.get(Session.class);
        if ( ! session ) return;
        PushRegistration p = (PushRegistration) dao.find(MLang.EQ(PushRegistration.SESSION, session.getId()));
        if ( p != null ) {
          PushRegistration newP = (PushRegistration) p.fclone();
          newP.setLastKnownState(state);
          dao.put(newP);
        }
      `
    }
  ]
});
