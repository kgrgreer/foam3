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
  name:'BalanceAdapterAccountDAO',
  extends: 'foam.dao.AbstractDAO',
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'currentAccount',
    'balanceDAO',
    'userDAO'
  ],

  requires: [
    'net.nanopay.account.Balance'
  ],

  methods: [
    function find_(x, id) {
      console.log("find method balanceadpater account dao");
    },
    function find(id) {
      var balance = this.balanceDAO.where(this.AND(
        this.EQ(net.nanopay.account.Balance.ACCOUNT_ID, id),
        this.EQ(net.nanopay.account.Balance.CURRENCY_CODE, this.currentAccount)
      )).select().then(function(result){
        if ( result.array.length != 0 && id != 0 ) {
          return net.nanopay.account.Balance.create({
            id: result.array[0].accountId,
            balance: result.array[0].balance
          });
        } else {
          return net.nanopay.account.Balance.create({
            id: id,
            balance: 0
          });
        }
      });
      return balance;
    }
  ]
})
