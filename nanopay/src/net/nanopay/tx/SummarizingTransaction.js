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

foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'SummarizingTransaction',
  documentation: 'Interface for transactions which act as summaries to a larger transaction chain',

  methods: [
    {
      name: 'categorize_',
      args: [
        { name: 't', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'String',
    },
    {
      documentation: `Collect all line items of succeeding transactions of self.`,
      name: 'collectLineItems',
    },
    {
      name: 'getChainSummary',
      type: 'net.nanopay.tx.ChainSummary'
    },
    {
      documentation: 'Returns childrens status.',
      name: 'calculateTransients',
      args: [
      { name: 'x', type: 'Context' },
      { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
    }
  ]
});
