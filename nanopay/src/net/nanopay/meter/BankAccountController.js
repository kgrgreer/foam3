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
  package: 'net.nanopay.meter',
  name: 'BankAccountController',
  extends: 'foam.comics.DAOController',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.bank.CABankAccount'
  ],

  imports: [
    'accountDAO'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        var dao = this.accountDAO.where(
          this.INSTANCE_OF(net.nanopay.bank.BankAccount)
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            this.BankAccount.NAME,
            this.BankAccount.OWNER,
            this.BankAccount.FLAG_IMAGE.clone().copyFrom({ tableWidth: 90 }),
            this.BankAccount.ACCOUNT_NUMBER.clone().copyFrom({ tableWidth: 120 }),
            this.BankAccount.STATUS.clone().copyFrom({ tableWidth: 110 }),
            foam.core.String.create({
              name: 'ownerType',
              tableCellFormatter: function(_, obj) {
                obj.owner$find.then((user) => {
                  this.add(user.cls_.name);
                });
              }
            })
          ]
        };
      }
    }
  ]
});
