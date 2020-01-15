foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GSReportAssembly',
  extends: 'foam.util.concurrent.AbstractAssembly',

  implements: [
    'foam.core.ContextAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'startTime',
    },
    {
      class: 'String',
      name: 'uuidReport'
    },
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'Long',
      name: 'txnCounter',
      synchronized: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.IngestionReport',
      name: 'report',
      documentation: 'bar to put to bar DAO'
    },
    {
      class: 'String',
      name: 'failedRows',
    },
    {
      class: 'Long',
      name: 'topUpCounter',
      synchronized: true
    },
    {
      class: 'Boolean',
      name: 'failed',
      value: false,
      synchronized: true
    },
    {
      class: 'String',
      name: 'failText',
      synchronized: true
    }
  ],
  methods: [
    {
      name: 'startJob',
      javaCode: `
      `
    },
    {
      name: 'executeJob',
      javaCode: `

      `
    },
    {
      name: 'endJob',
      javaCode: `
        Long elapsed = System.currentTimeMillis() - getStartTime();
        if (getFailed()){
          getReport().setReport(getFailText());
        }
        else {
          getReport().setReport(
          "Ingestion took: "+ (elapsed/60000)+ " minutes and "+((elapsed%60000)/1000)+ " seconds\\n"+"Top up transactions created: "+ getTopUpCounter()+"\\nTransactions Created from file: "+getTxnCounter()+"\\nFailed rows: "+ getFailedRows()
          );
        }
        foam.dao.DAO dao = (foam.dao.DAO) getX().get("ProgressBarDAO");
        dao.put(getReport());
      `
    },
    {
      name: 'incrementTxnCounter',
      synchronized: true,
      args: [{name: 'amount', type: 'Long'}],
      javaCode: `
        setTxnCounter(getTxnCounter()+amount);
      `
    },
    {
      name: 'incrementTopUpCounter',
      synchronized: true,
      args: [{name: 'amount', type: 'Long'}],
      javaCode: `
        setTopUpCounter(getTopUpCounter()+amount);
      `
    },
    {
      name: 'addToFailed',
      synchronized: true,
      args: [{name: 'addition', type: 'String'}],
      javaCode: `
        setFailedRows(getFailedRows()+ addition);
      `
    }
  ]
})
