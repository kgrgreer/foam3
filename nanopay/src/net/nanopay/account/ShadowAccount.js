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
  package: 'net.nanopay.account',
  name: 'ShadowAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.bank.BankAccount',
      targetDAOKey: 'accountDAO',
      name: 'bank',
      section: 'accountInformation',
      view: function(args, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.ReferenceView',
          dao: X.accountDAO.where(E.INSTANCE_OF(net.nanopay.bank.BankAccount)).orderBy(net.nanopay.account.Account.NAME),
          objToChoice: function(c) {
            return [c.id, c.name];
          }
        };
      }
    }
  ]
});

