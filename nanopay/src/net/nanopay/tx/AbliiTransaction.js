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
  package: 'net.nanopay.tx',
  name: 'AbliiTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  documentation: `Transaction to be created specifically for ablii users, enforces source/destination to always be bank accounts`,

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
  ],

  messages: [
    {
      name: 'PROHIBITED_MESSAGE',
      message: 'You do not have permission to pay invoices.'
    },
    {
      name: 'DESCRIPTION',
      message: 'Summary'
    },
  ],

  methods: [
    {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnCreate(x);

        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "business.invoice.pay") || ! auth.check(x, "user.invoice.pay") ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
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
        super.authorizeOnUpdate(x, oldObj);

        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "business.invoice.pay") || ! auth.check(x, "user.invoice.pay") ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnDelete(x);
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        super.authorizeOnRead(x);
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function(x) {
        return this.DESCRIPTION;
      },
      javaCode: `
        return "Summary";
      `
    }
  ]
});
