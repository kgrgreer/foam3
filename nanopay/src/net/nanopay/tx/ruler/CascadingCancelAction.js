foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'CascadingCancelAction',

  documentation: 'Gets the children transactions, sets their status to canceled and submits them to the dao.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = (Transaction) obj;
              List children = ((ArraySink) tx.getChildren(x).select(new ArraySink())).getArray();
              DAO localTransactionDAO = ((DAO) x.get("localTransactionDAO"));

              for ( Object o : children ) {
                Transaction t = (Transaction) o;
                t.setStatus(TransactionStatus.CANCELLED);
                localTransactionDAO.put(t);
              }
            }
         },"Cancel children transactions");
      `
    }
  ]
});
