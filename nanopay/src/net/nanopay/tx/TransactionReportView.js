foam.CLASS({
  package: 'net.nanopay.tx',
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
    'net.nanopay.tx.TransactionReport'
  ],

  imports: [
    'currencyDAO',
    'transactionDAO'
  ],

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
      return this.transactionDAO.select().then((transactions) => {
        return transactions.array.reduce((arr, transaction) => {
          var statusHistoryArr = transaction.statusHistory;
          if ( statusHistoryArr.length < 1 ) return arr;
          if ( statusHistoryArr[0].timeStamp > this.endDate ) return arr;
          if ( statusHistoryArr[statusHistoryArr.length-1].timeStamp < this.startDate ) return arr;
          for ( var i = statusHistoryArr.length-1; i >= 0; i-- ) {
            if ( statusHistoryArr[i].timeStamp <= this.endDate && statusHistoryArr[i].timeStamp >= this.startDate ) {
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

            var report = this.TransactionReport.create({
              id: txn.id,
              parent: txn.parent ? txn.parent : 'N/A',
              created: txn.created,
              type: txn.type,
              payeeId: txn.payeeId,
              payerId: txn.payerId,
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
          + this.startDate.toDateString()
          +'&endDate='
          + this.endDate.toDateString();
      window.location.assign(url);
      }
    }
  ]
});
