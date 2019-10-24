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
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionReport'
  ],

  imports: [
    'currencyDAO',
    'transactionDAO'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'startDate',

    },
    {
      class: 'DateTime',
      name: 'endDate',
    },
    {
      name: 'transactions'
    },
    {
      name: 'txnReport',
      factory: function() {
        return this.MDAO.create({ of: this.TransactionReport });
      },
      view: { class: 'foam.u2.view.TableView' }
    }
  ],

  methods: [
    async function initData() {
      this.transactions = await this.transactionDAO.select();
      // Todo: add filter based on the date.

      for ( var i = 0; i < this.transactions.array.length; i++ ) {
        var txn = this.transactions.array[i];

        var currency  = await this.currencyDAO.find(txn.sourceCurrency);
        var formatedFee = currency.format(txn.getCost());


        var report = this.TransactionReport.create({
          id: txn.id,
          parent: txn.parent ? txn.parent : 'N/A',
          created: txn.created,
          type: txn.type,
          payeeId: txn.payeeId,
          payerId: txn.payerId,
          amount: txn.amount,
          fee: formatedFee,
        });

        this.txnReport.put(report);
      }
    },

    async function initE() {
      this.SUPER();
      await this.initData();

      this.addClass(this.myClass())
        .add(this.TXN_REPORT);
    }
  ]
});
