/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.referral',
  name: 'ReferralCode',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  messages: [
    {
      name: 'LACKS_CREATE_PERMISSION',
      message: 'You do not have permission to create a payment code'
    },
    {
      name: 'LACKS_READ_PERMISSION',
      message: 'You do not have permission to read this payment code'
    },
    {
      name: 'LACKS_UPDATE_PERMISSION',
      message: 'You do not have permission to update this payment code'
    },
    {
      name: 'LACKS_REMOVE_PERMISSION',
      message: 'You do not have permission to remove this payment code'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'spid'
    },
    {
      class: 'String',
      name: 'url'
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
      AuthService auth = (AuthService) x.get("auth");
      if ( ! auth.check(x, "referralCode.create") ) {
        throw new AuthorizationException(LACKS_CREATE_PERMISSION);
      }
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
      User user = ((Subject) x.get("subject")).getUser();
      if (  user == null || ( ! auth.check(x, "referralCode.read." + getId()) && ! SafetyUtil.equals(user.getId(), getReferrer())) ) {
        throw new AuthorizationException(LACKS_READ_PERMISSION);
      }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      User user = ((Subject) x.get("subject")).getUser();
      if (  user == null || ( ! auth.check(x, "referralCode.update." + getId()) && ! SafetyUtil.equals(user.getId(), getReferrer()) ) ) {
        throw new AuthorizationException(LACKS_UPDATE_PERMISSION);
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
      if ( ! auth.check(x, "referralCode.remove." + getId()) ) {
        throw new AuthorizationException(LACKS_REMOVE_PERMISSION);
      }
      `
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.referral.ReferralCode',
  forwardName: 'referralCodes',
  inverseName: 'referrer',
  cardinality: '1:*'
});
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.referral.ReferralCode',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'referees',
  inverseName: 'referralCode',
  cardinality: '1:*'
});
