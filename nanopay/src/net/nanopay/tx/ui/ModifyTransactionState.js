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
        // Set Compliance Transaction to Complete write to dao
        // then set cash in to complete and write to dao
        var complianceTransactions = this.childTransactions.filter((t) => net.nanopay.tx.ComplianceTransaction.isInstance(t));
        var complianceObj = complianceTransactions[0];
        if ( complianceObj != undefined && complianceObj.status != this.TransactionStatus.COMPLETED ) {
          complianceObj.status = this.TransactionStatus.COMPLETED;
          await this.transactionDAO.put(complianceObj);
          await this.updateChildren();
        }

        var cashInTransactions = this.childTransactions.filter((t) => net.nanopay.tx.cico.CITransaction.isInstance(t));
        var cashInObj = cashInTransactions[0];
        if ( cashInObj == undefined ) {
          this.output = 'There is no cash in transaction to expedite.';
          return;
        }
        if ( cashInObj.status == this.TransactionStatus.COMPLETED ) {
          this.output = 'Cash In has already been completed.';
          return;
        }
        if ( cashInObj.status != this.TransactionStatus.PENDING
           && cashInObj.status != this.TransactionStatus.SENT ) {
          this.output = 'Cash In status must be pending or sent to expedite.';
          return;
        }
        
        cashInObj.status = this.TransactionStatus.COMPLETED;
        await this.transactionDAO.put(cashInObj);
        this.output = 'Cash In successfully expedited';
        this.updateChildren();
      }
    },
    {
      name: 'expediteCashOut',
      section: 'transactionInfo',
      confirmationRequired: true,
      code: async function(X) {
        // check if cash out is status pending, if it is change to complete and write to dao
        var cashOutTransactions = this.childTransactions.filter((t) => net.nanopay.tx.cico.COTransaction.isInstance(t));
        var cashOutObj = cashOutTransactions[0];

        if ( cashOutObj == undefined ) {
          this.output = 'There is no cash out transaction to expedite.';
          return;
        }
        if ( cashOutObj.status == this.TransactionStatus.COMPLETED ) {
          this.output = 'Cash Out has already been completed.';
          return;
        }
        if ( cashOutObj.status != this.TransactionStatus.PENDING
           && cashOutObj.status != this.TransactionStatus.SENT ) {
          this.output = 'Cash Out status must be pending or sent to expedite.';
          return;
        }

        cashOutObj.status = this.TransactionStatus.COMPLETED;
        await this.transactionDAO.put(cashOutObj);
        this.output = 'Cash Out successfully expedited.';
      }
    },
    {
      name: 'back',
      label: 'Back',
      section: 'outputSection',
      code: function(X) {
        this.stack.back();
      }
    }
  ]
});
