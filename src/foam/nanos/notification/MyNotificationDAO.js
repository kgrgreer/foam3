/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'MyNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.*',
    'foam.mlang.MLang',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.notification.Notification',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  documentation: `
    DAO decorator that adds a filter to retrieve only the context subject user's notifications
  `,


  methods: [
    {
      name: 'select_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getRealUser();
        if ( user == null ) return sink;
        return getDelegate().where(MLang.AND(
            MLang.EQ(Notification.USER_ID, user.getId()),
            MLang. EQ (Notification. IN_APP_ENABLED, true),
            MLang.NOT(MLang.IN(Notification.NOTIFICATION_TYPE, user.getDisabledTopics()))
          )).select_(getX(), sink, skip, limit, order, predicate);
      `
    }
  ],
});
