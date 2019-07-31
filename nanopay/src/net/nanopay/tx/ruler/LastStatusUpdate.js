foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'LastStatusUpdate',

  documentation: 'update the last status change date if status changed on put',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'java.util.Calendar',
    'java.util.TimeZone'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction txn = (Transaction) obj;
        Transaction oldTxn = (Transaction) oldObj;
        if ( txn.getStatus() != oldTxn.getStatus() ) {
         txn.setLastStatusChange(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
        }
      `
    }
  ]
});
