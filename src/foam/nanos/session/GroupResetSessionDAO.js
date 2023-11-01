/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'GroupResetSessionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Reset cache applyContext on group changes. Generally it is the group url which changes',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.List'
  ],

  javaCode: `
  public GroupResetSessionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  `,

  methods: [
    {
      name: 'put_',
      javaCode: `
      Group nu = (Group) obj;
      Group old = (Group) getDelegate().find_(x, nu.getId());
      nu = (Group) getDelegate().put_(x, nu);

      // NOTE: for now just concerned with change on url
      if ( old != null &&
           ! SafetyUtil.equals(old.getUrl(), nu.getUrl()) ) {
        Group group = nu;
        do {
          List<User> users = (List) ((ArraySink) ((DAO) x.get("localUserDAO"))
            .where(EQ(User.GROUP, nu.getId()))
            .select(new ArraySink())).getArray();
          for ( User user : users ) {
            List<Session> sessions = (List) ((ArraySink) ((DAO) x.get("sessionDAO"))
              .where(
                OR(
                  EQ(Session.USER_ID, user.getId()),
                  EQ(Session.AGENT_ID, user.getId())
                ))
              .select(new ArraySink())).getArray();
            for ( Session session : sessions ) {
              Session.APPLY_CONTEXT.clear(session);
            }
          }
          group = group.findParent(x);
        } while ( group != null );
      }
      return nu;
      `
    }
  ]
});
