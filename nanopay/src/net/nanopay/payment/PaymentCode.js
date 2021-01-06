/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentCode',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',

    'java.util.*'
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
      User user = ((Subject) x.get("subject")).getUser();
      if (  user == null || ( ! auth.check(x, "paymentcode.read." + getId()) && ! SafetyUtil.equals(user.getId(), getOwner())) ) {
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
      if (  user == null || ( ! auth.check(x, "paymentcode.update." + getId()) && ! SafetyUtil.equals(user.getId(), getOwner()) ) ) {
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
