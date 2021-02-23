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
  package: 'net.nanopay.meter.report',
  name: 'TransactionReportView',
  extends: 'foam.u2.Controller',

  documentation: 'A custom transaction report view.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.MDAO',
    'foam.u2.view.date.DateTimePicker',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.meter.report.TransactionReport'
  ],

  imports: [
    'accountDAO',
    'currencyDAO',
    'transactionDAO'
  ],

  css: `
    ^ .property-txnReportDAO {
      width: 1600px;
    }
  `,

  properties: [
    {
      class: 'Date',
      name: 'startDate',

    },
    {
      class: 'Date',
      name: 'endDate',
    },
    {
      name: 'txnReportDAO',
      factory: function() {
        return this.MDAO.create({ of: this.TransactionReport });
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'created',
          'id',
          'parent',
          'type',
          'payerId',
          'payeeId',
          'amount',
          'fee',
          'status',
          'statusUpdateTime'
        ]
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.onDetach(this.startDate$.sub(() => {
        this.updateDAO();
      }));
      this.onDetach(this.endDate$.sub(() => {
        this.updateDAO();
      }));

      this.addClass(this.myClass())
        .start(this.DateTimePicker,
          {
            showTimeOfDay: false,
            data$: this.startDate$
          })
        .end()
        .start(this.DateTimePicker,
          {
            showTimeOfDay: false,
            data$: this.endDate$
          })
        .end()
        .start('div')
          .tag(this.EXPORT_TXN_REPORT)
        .end()
        .add(this.TXN_REPORT_DAO);
    },

    async function getFilteredTransactions() {
      if ( ! this.startDate || ! this.endDate ) return [];

      return this.transactionDAO
        .where(this.OR(
          this.INSTANCE_OF(net.nanopay.tx.cico.CITransaction),
          this.INSTANCE_OF(net.nanopay.tx.cico.COTransaction),
          this.INSTANCE_OF(net.nanopay.tx.DigitalTransaction),
          this.INSTANCE_OF(net.nanopay.tx.BulkTransaction)
        ))
        .select()
        .then((transactions) => {
          this.startDate.setHours(0, 0, 0, 0);
          this.endDate.setHours(23, 59, 59);

          return transactions.array.reduce((arr, transaction) => {
            var statusHistoryArr = transaction.statusHistory;
            if ( statusHistoryArr.length < 1 ) return arr;

            var firstStatusHistory = statusHistoryArr[0].timeStamp;
            if ( firstStatusHistory > this.endDate ) return arr;

            var lastStatusHistory = statusHistoryArr[statusHistoryArr.length-1]
              .timeStamp;
            if ( lastStatusHistory < this.startDate ) return arr;

            for ( var i = statusHistoryArr.length-1; i >= 0; i-- ) {
              var statusHistoryTimeStamp = statusHistoryArr[i].timeStamp;

              if ( statusHistoryTimeStamp <= this.endDate
                && statusHistoryTimeStamp >= this.startDate ) {
                transaction.status = statusHistoryArr[i].status;
                transaction.lastModified = statusHistoryArr[i].timeStamp;
                arr.push(transaction);
                return arr;
              }
            }
          }, []);
        });
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      code: async function() {
        this.txnReportDAO = this.MDAO.create({ of: this.TransactionReport });
        var transactions = await this.getFilteredTransactions();

        if ( transactions ) {
          for ( var i = 0; i < transactions.length; i++ ) {
            var txn = transactions[i];
            var currency  = await this.currencyDAO.find(txn.sourceCurrency);
            var formattedFee = currency.format(txn.getCost());
            var formattedAmount = currency.format(txn.amount);

            var payerAccount = await this.accountDAO.find(txn.sourceAccount);
            var payeeAccount = await this.accountDAO.find(txn.destinationAccount);

            var rootTxn = await txn.findRoot();

            var report = this.TransactionReport.create({
              id: txn.id,
              parent: rootTxn ? rootTxn.id : 'N/A',
              created: txn.created,
              type: txn.type,
              payeeId: payeeAccount.owner,
              payerId: payerAccount.owner,
              amount: formattedAmount,
              fee: formattedFee,
              status: txn.status,
              statusUpdateTime: txn.lastModified
            });

            this.txnReportDAO.put(report);
          }
        }
      }
    }
  ],

  actions: [
    {
      name: 'exportTxnReport',
      label: 'Download Transaction Report',
      code: function() {
        var url = window.location.origin
          + '/service/genTxnReport?startDate='
          + this.startDate.toLocaleDateString(foam.locale)
          +'&endDate='
          + this.endDate.toLocaleDateString(foam.locale);
        window.location.assign(url);
      }
    }
  ]
});
