foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentCode',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.*'
  ],

  messages: [
    {
      name: 'LACKS_CREATE_PERMISSION',
      message: 'You do not have permission to create a payment code.'
    },
    {
      name: 'LACKS_READ_PERMISSION',
      message: 'You do not have permission to read this payment code.'
    },
    {
      name: 'LACKS_UPDATE_PERMISSION',
      message: 'You do not have permission to update this payment code.'
    },
    {
      name: 'LACKS_REMOVE_PERMISSION',
      message: 'You do not have permission to remove this payment code.'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      javaFactory: `
      return UUID.randomUUID().toString().replace("-", "");
     `
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
      if ( ! auth.check(x, "paymentcode.create") ) {
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
      User user = (User) x.get("user");
      if (  user == null || ( ! auth.check(x, "paymentcode.read." + getId()) && SafetyUtil.equals(String.valueOf(user.getId()), getOwner())) ) {
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
      User user = (User) x.get("user");
      if (  user == null || ( ! auth.check(x, "paymentcode.update." + getId()) && SafetyUtil.equals(String.valueOf(user.getId()), getOwner()) ) ) {
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
      if ( ! auth.check(x, "paymentcode.remove." + getId()) ) {
        throw new AuthorizationException(LACKS_REMOVE_PERMISSION);
      }
      `
    }
  ],
});
