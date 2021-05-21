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
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'InstructionCombinedSummary',

  documentation: 'Represents a combined disbursement instruction summary',

  properties: [
    {
      class: 'String',
      name: 'batchId',
      documentation:
        `Unique merchant batch number which is globally unique per merchant per file
         Should be the same with BatchID part of the filename.`
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      documentation: 'Source currency'
    },
    {
      class: 'Float',
      name: 'totalSourceAmount',
      documentation: 'Total amount in source currency in this batch',
    },
    {
      class: 'String',
      name: 'targetCurrency',
      documentation: 'Disbursement currency, only support CNY for now',
      value: 'CNY'
    },
    {
      class: 'Float',
      name: 'totalTargetAmount',
      documentation: 'Total amount in target currency in this batch'
    },
    {
      class: 'Int',
      name: 'totalCount',
      documentation: 'Total disbursement instructions in this batch'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.DistributionMode',
      name: 'distributeMode',
      documentation: 'Distribution mode'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.InstructionType',
      name: 'instructionType',
      documentation: 'Instruction type'
    }
  ]
});
