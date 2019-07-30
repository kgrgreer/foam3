foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ModifyTransactionState',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'approvalRequestDAO',
    'stack',
    'transactionDAO'
  ],

  requires: [
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
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
      code: function(X) {
        // fetch compliance and cash in transactions, update status and write to dao
        var cashInTransactions = this.childTransactions.filter((t) => this.CITransaction.isInstance(t));
        for ( var i = 0; i < cashInTransactions.length; i++ ) {
          var cashInObj = cashInTransactions[i];
          console.log(cashInObj);
          this.approvalRequestDAO.where(
            this.AND(
              this.EQ(this.ComplianceApprovalRequest.OBJ_ID, cashInObj.id),
              this.EQ(this.ComplianceApprovalRequest.DAO_KEY, 'localTransactionDAO')
            )
          ).select().then(function(a) {
            console.log(a);
          });
          this.output = 'Cash In transaction has been submitted for expedition.';
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
