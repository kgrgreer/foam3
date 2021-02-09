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
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.RetailTransaction',
    'net.nanopay.merchant.ui.ErrorMessage',
    'net.nanopay.merchant.ui.transaction.TransactionRowView'
  ],

  imports: [
    'currentAccount',
    'user',
    'device',
    'toolbarIcon',
    'toolbarTitle',
    'transactionDAO'
  ],

  css: `
    ^ {
      height: 100%;
      background-color: #ffffff;
      position: relative;
      overflow: auto;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'Transactions';
      this.toolbarIcon = 'menu';

      this.addClass(this.myClass());
      this.transactionDAO.where(this.AND(
        this.EQ(this.RetailTransaction.DEVICE_ID, this.device.id)),
        this.OR(
          this.EQ(this.RetailTransaction.SOURCE_ACCOUNT, this.currentAccount),
          this.EQ(this.RetailTransaction.DESTINATION_ACCOUNT, this.currentAccount)
        )
      ).select().then(function(result) {
        if ( ! result ) {
          throw new Error('Unable to load transactions');
        }

        var a = result.array;
        for ( var i = 0; i < a.length; i++ ) {
          // skip transactions that don't apply
          if ( a[i].destinationAccount !== self.currentAccount &&
            a[i].sourceAccount !== self.currentAccount ) {
            continue;
          }

          self.add(self.TransactionRowView.create({
            transaction: a[i]
          }));
        }
      })
      .catch(function(err) {
        self.tag(self.ErrorMessage.create({ message: err.message }));
      });
    }
  ]
});
