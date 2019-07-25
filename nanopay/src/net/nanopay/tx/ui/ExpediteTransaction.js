foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ExpediteTransaction',

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

  css: `
    .property-output {
      margin-bottom: 45px;
    }
  `,

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      postSet: function() {
        this.childTransactions = [];
        this.transaction$find
          .then((t) => this.getChildren(t))
          .then((a) => {
            this.childTransactions = a;
          });
      }
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'childTransactions',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'output',
      visiblityExpression: function(output) {
        return output ? foam.u2.Visibility.RO : foam.u2.Visiblity.HIDDEN;
      }
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
    }
  ],

  actions: [
    {
      name: 'expediteCashIn',
      label: 'Expedite Cash In',
      confirmationRequired: true,
      code: async function(X) {
        // Set Compliance Transaction to Complete write to dao
        // then set cash in to complete and write to dao
        var complianceFilter = this.childTransactions.filter((t) => t.type == 'ComplianceTransaction');
        var cashInFilter = this.childTransactions.filter((t) => t.type == 'AlternaCITransaction');
        var cashInObj = cashInFilter[0];

        if ( cashInObj == undefined ) {
          this.output = 'There is no cash in transaction to expedite.';
          return;
        }
        if ( cashInObj.status == this.TransactionStatus.COMPLETED ) {
          this.output = 'Cash In transaction is already completed.';
          return;
        }

        var complianceObj = complianceFilter[0];
        complianceObj.status = this.TransactionStatus.COMPLETED;
        await this.transactionDAO.put(complianceObj);

        cashInObj.status = this.TransactionStatus.COMPLETED;
        await this.transactionDAO.put(cashInObj);
        this.output = 'Cash In successfully expedited';
      }
    },
    {
      name: 'expediteCashOut',
      label: 'Expedite Cash Out',
      confirmationRequired: true,
      code: async function(X) {
        // check if cash out is status pending, if it is change to complete and write to dao
        var cashOutFilter = this.childTransactions.filter((t) => t.type == 'AlternaCOTransaction');
        var cashOutObj = cashOutFilter[0];

        if ( cashOutObj == undefined ) {
          this.output = 'There is no cash out transaction to expedite.';
          return;
        }
        if ( cashOutObj.status == this.TransactionStatus.COMPLETED ) {
          this.output = 'Cash Out transaction is already completed.';
          return;
        }
        if ( cashOutObj.status != this.TransactionStatus.PENDING ) {
          this.output = 'Cash Out status must be pending in order to complete.';
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
      code: function(X) {
        this.stack.back();
      }
    }
  ]
});
