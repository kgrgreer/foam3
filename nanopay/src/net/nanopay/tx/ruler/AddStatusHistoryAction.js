foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AddStatusHistoryAction',
  documentation: 'Adds an entry into the status history of a transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        HistoricStatus [] hOld = obj.getStatusHistory();
        HistoricStatus [] hNu = new HistoricStatus[hOld.length + 1];
        System.arraycopy(hOld, 0, hNu, 0, hOld.length);
        HistoricStatus hs = new HistoricStatus();
        hs.setStatus(obj.getStatus());
        hNu[hNu.length-1] = hs;
        obj.setStatusHistory(hNu);
      `
    }
  ]
});
