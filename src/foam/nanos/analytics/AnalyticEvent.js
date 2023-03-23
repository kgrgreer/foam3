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
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException'
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
      preSet: function(old, nu) {
        return nu && nu.split('-')[0] || nu;
      },
      javaPreSet: `
      if ( ! foam.util.SafetyUtil.isEmpty(val) ) {
        val = val.split("-")[0];
      }
      `
    },
    {
      class: 'Object',
      name: 'objectId'
    },
    {
      class: 'String',
      name: 'extra'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // nop - open to write
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
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
      args: [
        { name: 'x', type: 'Context' }
      ],
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
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if (
          ! auth.check(x, "user.remove." + this.getId())
        ) {
          throw new AuthorizationException();
        }
      `
    },
  ]
})
