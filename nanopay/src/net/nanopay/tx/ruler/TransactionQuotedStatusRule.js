foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionQuotedStatusRule',

  documentation: `Flag PAUSED or SCHEDULED transaction as quoted to prevent quoting.`,

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
