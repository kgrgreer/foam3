foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ModifyTransactionState',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'transactionDAO',
    'stack'
  ],

  requires: [
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  sections: [
    {
      name: 'transactionInfo',
      gridColumns: 6
    },
    {
      name: 'outputSection',
      label: 'Output',
      gridColumns: 6
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      section: 'transactionInfo',
      postSet: function() {
        this.childTransactions = [];
        this.updateChildren();
      }
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'childTransactions',
      section: 'transactionInfo',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'output',
      label: '',
      section: 'outputSection',
      view: {
        class: 'foam.u2.tag.TextArea'
      },
      visibility: 'RO',
      value: 'Click an action'
    }
  ],

  methods: [
    async function getChildren(transaction) {
      // fetch all child transactions that are chained to AbliiTransaction
      var children = [transaction];
      if ( transaction.children ) {
        var txnChildren = await transaction.children.select();
        for ( var txn of txnChildren.array ) {
          var childChildren = await this.getChildren(txn);
          children = children.concat(childChildren);
        }
      }
      return children;
    },
    async function updateChildren() {
      // update child transactions in case states have changed
      await this.transaction$find
          .then((t) => this.getChildren(t))
          .then((a) => {
            this.childTransactions = a;
          });
    }
  ],

  actions: [
    {
      name: 'expediteCashIn',
      section: 'transactionInfo',
      confirmationRequired: true,
      code: async function(X) {
        // fetch compliance and cash in transactions, update status and write to dao
        var complianceTransactions = this.childTransactions.filter((t) => this.ComplianceTransaction.isInstance(t));
        for ( var i = 0; i < complianceTransactions.length; i++ ) {
          var complianceObj = complianceTransactions[i];
          if ( complianceObj != undefined && complianceObj.status != this.TransactionStatus.COMPLETED ) {
            complianceObj.status = this.TransactionStatus.COMPLETED;
            await this.transactionDAO.put(complianceObj);
            await this.updateChildren();
          }
        }
        
        var cashInTransactions = this.childTransactions.filter((t) => this.CITransaction.isInstance(t));
        for ( var i = 0; i < cashInTransactions.length; i++ ) {
          var cashInObj = cashInTransactions[i];
          var status = cashInObj.status;

          if ( cashInObj != undefined && status != this.TransactionStatus.COMPLETED
             && status == this.TransactionStatus.PENDING || status == this.TransactionStatus.SENT ) {
              cashInObj.status = this.TransactionStatus.COMPLETED;
              await this.transactionDAO.put(cashInObj);
              this.output = 'Cash In successfully expedited';
              this.updateChildren();
          } else {
            this.output = 'Cash In is either non existent or the status is not pending or sent.';
          }
        }
      }
    },
    {
      name: 'expediteCashOut',
      section: 'transactionInfo',
      confirmationRequired: true,
      code: async function(X) {
        // fetch cash out transactions, update status and write to dao
        var cashOutTransactions = this.childTransactions.filter((t) => this.COTransaction.isInstance(t));
        for ( var i = 0; i < cashOutTransactions.length; i++ ) {
          var cashOutObj = cashOutTransactions[i];
          var status = cashOutObj.status;

          if ( cashOutObj != undefined && status != this.TransactionStatus.COMPLETED
             && status == this.TransactionStatus.PENDING || status == this.TransactionStatus.SENT ) {
              cashOutObj.status = this.TransactionStatus.COMPLETED;
              await this.transactionDAO.put(cashOutObj);
              this.output = 'Cash Out successfully expedited.';
          } else {
            this.output = 'Cash Out is either non existent or the status is not pending or sent.';
          }
        }
      }
    },
    {
      name: 'back',
      section: 'outputSection',
      code: function(X) {
        this.stack.back();
      }
    }
  ]
});
