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
  package: 'net.nanopay.tx',
  name: 'SummaryTransactionInnerDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.*',
    'foam.core.FObject',
    'foam.core.X',
    'net.nanopay.tx.SummarizingTransaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        // Summary transactions are created internally and should
        // never be put through the summaryTransactionDAO. Putting 
        // a summary transaction only happens when we are trying to 
        // trigger a DUG rule, so return immediately instead of trying
        // to put to the underlying DAO.
        if ( obj instanceof SummarizingTransaction ) {
          return obj;
        }

        return super.put_(x, obj);
      `
    }
  ]
});
