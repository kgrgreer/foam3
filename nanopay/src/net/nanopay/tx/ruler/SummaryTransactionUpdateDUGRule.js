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
    package: 'net.nanopay.tx.ruler',
    name: 'SummaryTransactionUpdateDUGRule',

    documentation: 'Update a DUGRule on summarizingTransactionDAO.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.nanos.dig.DUGRule',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
          // Add this predicate to any DUGRule on the summaryTransactionDAO
          DUGRule dugRule = (DUGRule) obj;
          dugRule.setPredicate(foam.mlang.MLang.INSTANCE_OF(net.nanopay.tx.SummarizingTransaction.class));
        `
      }
    ]
  });
