foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXSummaryTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Transaction used as a summary to for AFEX BMO transactions`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Currency',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
     documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
     name: 'canTransfer',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'oldTxn',
         type: 'net.nanopay.tx.model.Transaction'
       }
     ],
     type: 'Boolean',
     javaCode: `
       return false;
     `
   },
   {
     documentation: `return true when status change is such that reveral Transfers should be executed (applied)`,
     name: 'canReverseTransfer',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'oldTxn',
         type: 'net.nanopay.tx.model.Transaction'
       }
     ],
     type: 'Boolean',
     javaCode: `
       return false;
     `
   }
 ]

});
