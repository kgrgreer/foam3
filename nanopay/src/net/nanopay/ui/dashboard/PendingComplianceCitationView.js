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
  package: 'net.nanopay.ui.dashboard',
  name: 'PendingComplianceCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  imports: [
    'accountDAO'
  ],

  requires: [
    'foam.counter.Counter',
    'foam.nanos.auth.User',
    'net.nanopay.meter.report.ScreeningResponseCounter',
    'net.nanopay.meter.report.ScreeningResponseType',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.ComplianceTransaction',
  ],

  methods: [
    function initE() {
      var self = this;
      this.accountDAO.find(this.EQ(this.BankAccount.INSTITUTION, this.data.id)).then(function(acc) {
        self.addClass(self.myClass())
        .on('click', function() {
          self.openFilteredListView(acc);
        })
        .start()
          .start().addClass('id')
            .start('img')
              .attrs({ src: acc.flagImage })
              .addClass('flag')
            .end()
            .add(acc.name)
          .end()
        .end()
        .start()
          .addClass(self.myClass('value'))
          .add(self.data.value)
        .end()
      })
    },

    function openFilteredListView(obj) {
      var self = this;
      this.__subContext__['accountDAO'].where(this.EQ(this.BankAccount.INSTITUTION, obj.institution)).select()
        .then(function(ret) {
        var ids = [];
        for ( i = 0; i < ret.array.length; i++ ) {
          ids.push(ret.array[i].id);
        }

        var dao = self.__subContext__['transactionDAO'].where(self.AND(
          self.INSTANCE_OF(self.ComplianceTransaction),
          self.EQ(self.Transaction.STATUS, self.TransactionStatus.PENDING),
          self.IN(self.Transaction.SOURCE_ACCOUNT, ids)
        ))
        var config = foam.comics.v2.DAOControllerConfig.create({ dao: dao, hideQueryBar: false });
        self.stack.push({
          class: 'foam.comics.v2.DAOBrowserView',
          config: config
        });


        })
      }
  ],

  css: `
    ^ .id {
      width: 80%;
      font-size: 20px;
      display: flex;
      align-items: center;
      font-weight: 300;
      font-size: 13px;
      color: gray;
    }
    img {
      padding-right: 10px;
    }
  `
});
