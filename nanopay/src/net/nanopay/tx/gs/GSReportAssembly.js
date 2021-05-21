/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
      of: 'net.nanopay.tx.gs.ProgressBarData',
      name: 'progressBarData'
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
        // no-op
      `
    },
    {
      name: 'executeJob',
      javaCode: `
        // no-op
      `
    },
    {
      name: 'endJob',
      javaCode: `
        Long elapsed = System.currentTimeMillis() - getStartTime();

        if ( getFailed() ){
          getProgressBarData().setReport(getFailText());
          getProgressBarData().setStatus("File upload has failed");
          getProgressBarData().setStatusPass(false);
        } else {
          getProgressBarData().setReport(
            "Ingestion took: " +
            (elapsed / 60000) +
            " minutes and " +
            ((elapsed % 60000) / 1000) +
            " seconds\\nTop up transactions created: " +
            getTopUpCounter() +
            "\\nTransactions Created from file: " +
            getTxnCounter() +
            "\\nFailed rows: " +
            getFailedRows()
          );
          getProgressBarData().setStatusPass(true);
          getProgressBarData().setStatus("File upload complete");
        }
        getProgressBarData().setValue(getProgressBarData().getMaxValue());
        foam.dao.DAO dao = (foam.dao.DAO) getX().get("ProgressBarDAO");
        dao.put(getProgressBarData());
      `
    },
    {
      name: 'incrementTxnCounter',
      synchronized: true,
      args: [{name: 'amount', type: 'Long'}],
      javaCode: `
        setTxnCounter(getTxnCounter() + amount);
      `
    },
    {
      name: 'incrementTopUpCounter',
      synchronized: true,
      args: [{name: 'amount', type: 'Long'}],
      javaCode: `
        setTopUpCounter(getTopUpCounter() + amount);
      `
    },
    {
      name: 'addToFailed',
      synchronized: true,
      args: [{name: 'addition', type: 'String'}],
      javaCode: `
        setFailedRows(getFailedRows() + addition);
      `
    }
  ]
})
