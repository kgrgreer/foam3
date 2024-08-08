/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'AnalyticEvent',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      writePermissionRequired: true
    },
    {
      class: 'Duration',
      name: 'duration',
      units: 's'
    },
    {
      class: 'StringArray',
      name: 'tags'
    },
    {
      class: 'String',
      name: 'traceId'
    },
    {
      class: 'String',
      name: 'sessionId',
      factory: function() {
        var subject = this.__context__.subject;
        if ( subject ) {
          var user = subject.user;
          if ( user && user.id > 0 && user.trackingId ) {
            return user.trackingId;
          }
        }
        return this.__context__.sessionID;
      },
      javaFactory: `
        Subject subject = (Subject) getX().get("subject");
        if ( subject != null ) {
          User user = subject.getUser();
          if ( user != null && user.getId() > 0 ) {
            if ( ! "".equals(user.getTrackingId()) ) return user.getTrackingId();
            return String.valueOf(user.getId());
          }
        }
        Session session = getX().get(Session.class);
        if ( session != null ) return session.getId();
        return "system";
      `
    },
    {
      class: 'Object',
      name: 'objectId'
    },
    {
      class: 'String',
      name: 'extra',
      documentation: 'a string or a json string'
    },
    {
      class: 'String',
      name: 'userAgent',
      factory: function() {
        return window.navigator.userAgent;
      }
    },
    {
      class: 'String',
      name: 'ip',
      javaFactory: `
        X x = foam.core.XLocator.get();
        return foam.net.IPSupport.instance().getRemoteIp(x);
      `
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.sessionId;
      this.userAgent;
    },
    {
      name: 'authorizeOnCreate',
      args: 'Context x',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // nop - open to write
      `
    },
    {
      name: 'authorizeOnRead',
      args: 'Context x',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if (
          ! auth.check(x, "user.read." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: 'Context x',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if (
          ! auth.check(x, "user.update." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: 'Context x',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if (
          ! auth.check(x, "user.remove." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    }
  ]
})
