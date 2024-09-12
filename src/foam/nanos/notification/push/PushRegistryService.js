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

        Session session = x.get(Session.class);
        if ( session != null ) {
          r.setSession(session.getId());
        } else {
          throw new IllegalArgumentException("Trying to register push without session");
        }    
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

        // Check if this entry exists in dao and belongs to a real user, if yes, dont override;
        // Otherwise we lose the user's endpoint every time they sign out
        DAO dao = (DAO) x.get("pushRegistrationDAO");
        boolean isAnonymous = ((AuthService) x.get("auth")).isAnonymous(x);
        if ( isAnonymous ) {
          PushRegistration p = (PushRegistration) dao.find(r.getSession());
          if ( p != null && p.getUser() != user.getId() ) {
            return;
          }
        }
        // Rare scenario where the user gets assigned a new session but their device maintains their old endpoint
        PushRegistration p2 = (PushRegistration) dao.find(MLang.EQ(PushRegistration.ENDPOINT, endpoint));
        if ( p2 != null ) {
          // Can treat this as an invalid token and the entry can be deleted as it is about to be replaced
          dao.remove(p2);
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
        if ( session == null ) throw new IllegalArgumentException("Trying to register push without session");

        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) throw new IllegalArgumentException("Missing user.");
        
        PushRegistration p = (PushRegistration) dao.find(session.getId());
        PushRegistration newP;
        if ( p != null ) {
          newP = (PushRegistration) p.fclone();
        } else {
          newP = new PushRegistration();
          newP.setSession(session.getId());
          newP.setUser(user.getId());
        }
        newP.setLastKnownState(state);
        dao.put(newP);
      `
    }
  ]
});
