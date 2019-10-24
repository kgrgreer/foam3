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
      name: 'filteredTransactionDAO',
      expression: function(startDate) {
        if ( ! startDate ) return this.transactionDAO;
        return this.transactionDAO.where(this.GTE(this.Transaction.CREATED, startDate));
      }
    },
    {
      name: 'txnReportDAO',
      factory: function() {
        return this.MDAO.create({ of: this.TransactionReport });
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'id',
          'parent',
          'created',
          'payeeId',
          'payerId',
          'amount',
          'fee'
        ]
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.onDetach(this.startDate$.sub(function() {
        self.updateDAO();
      }));

      this.addClass(this.myClass())
        .start(this.DateTimePicker,
          {
            showTimeOfDay: false,
            data$: this.startDate$
          })
        .end()
        .add(this.TXN_REPORT_DAO);
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      code: async function() {
        this.txnReportDAO = this.MDAO.create({ of: this.TransactionReport });
        var transactions = await this.filteredTransactionDAO.select();

        for ( var i = 0; i < transactions.array.length; i++ ) {
          var txn = transactions.array[i];
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
          });

          this.txnReportDAO.put(report);
        }
      }
    }
  ]
});
