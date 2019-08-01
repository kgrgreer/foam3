foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuotedStatusRule',

  documentation: `Flag PAUSED or SCHEDULED transactions as quoted to prevent quoting of transaction.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction transaction = (Transaction) obj;
        transaction.setIsQuoted(true);
      `
    }
  ]
});
