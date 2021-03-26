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
  package: 'net.nanopay.country.br.tx',
  name: 'ExchangeLimitTransactionCronAgentSink',
  extends: 'foam.dao.AbstractSink',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      documentation: `Time that a transaction must exist in PENDING before this agent acts.`,
      name: 'threshold',
      class: 'Long',
      value: 30000
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
      Transaction txn = (Transaction) obj;
      Long tm = txn.getCreated().getTime();
      if ( txn.getLastStatusChange() != null ) {
        tm = txn.getLastStatusChange().getTime();
      }
      if ( System.currentTimeMillis() - tm > getThreshold() ) {
        txn = (Transaction) txn.fclone();
        getDao().put_(getX(), txn);
      }
      `
    }
  ]
});
