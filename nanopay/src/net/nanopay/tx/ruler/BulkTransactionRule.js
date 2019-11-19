foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'BulkTransactionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `A custom action for the associated rule which can add fee
    to the cashout transactions.
  `,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.FeeLineItem',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'fee',
      value: 150
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Transaction transaction = (Transaction) obj;
          DAO transactionDAO = (DAO) x.get("localTransactionDAO");
  
          if (transaction instanceof COTransaction) {
            // Set fee lineitem for cashout transaction
            transaction.addLineItems(new TransactionLineItem[] {
              new FeeLineItem.Builder(getX())
                .setName("Transaction Fee")
                .setAmount(getFee())
                .build()
            },null);
            transactionDAO.put(transaction);
          }
        }
      }, "Add fee completed notification");
      `
    }
  ]
});
