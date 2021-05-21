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
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimitDetail',
  documentation: `The base model for representing the remaining limit`,

  properties: [
    {
      class: 'Object',
      name: 'transactionLimitProbes',
    },
    {
      class: 'String',
      name: 'sourceCurrency',
    },
    {
      class: 'String',
      name: 'destinationCurrency',
    },
    {
      class: 'String',
      name: 'limitAmount',
      documentation: 'The limit amount for current rule'
    },
    {
      class: 'Boolean',
      name: 'send',
      documentation: `A boolean indicate if limit applied when send request money (True) 
      or receive request money (False) `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.TxLimitEntityType',
      name: 'applyTo',
      documentation: 'limit applied on user/business/account'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
    },
    {
      class: 'String',
      name: 'remainLimit',
      documentation: 'the remaining transaction limit'
    },
    {
      class: 'String',
      name: 'ruleDescription',
      documentation: 'An description explain why this limit apply on this business/user/account'
    },
  ],
});
