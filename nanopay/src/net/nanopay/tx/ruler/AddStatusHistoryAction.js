foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AddStatusHistoryAction',
  documentation: 'Adds an entry into the status history of a transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.HistoricStatus',
    'net.nanopay.tx.model.Transaction',
    'java.util.Date'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction tx = (Transaction) obj;
        HistoricStatus [] hOld = tx.getStatusHistory();
        HistoricStatus [] hNu = new HistoricStatus[hOld.length + 1];
        System.arraycopy(hOld, 0, hNu, 0, hOld.length);
        HistoricStatus hs = new HistoricStatus();
        hs.setStatus(tx.getStatus());
        hs.setTimeStamp(new Date());
        hNu[hNu.length-1] = hs;
        tx.setStatusHistory(hNu);
      `
    }
  ]
});
