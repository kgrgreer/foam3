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
  name: 'PreProcessResultSummary',

  documentation: 'Represents a pre-process result summary',

  properties: [
    {
      class: 'String',
      name: 'batchId',
      documentation: 'Unique merchant batch number which is globally unique per merchant per file'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.ResultCode',
      name: 'preProcessResult',
      documentation: 'Batch pre-process result'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      documentation: 'Source currency'
    },
    {
      class: 'Float',
      name: 'originalSourceAmount',
      documentation: 'Original total amount in source currency in this batch Available when distributeMode = 0'
    },
    {
      class: 'Float',
      name: 'realSourceAmount',
      documentation:
        `Real total amount in source currency to be disbursed in this batch after preprocessing
        Available when distributeMode = 0; or when distributeMode = 1 and rate is available`
    },
    {
      class: 'String',
      name: 'targetCurrency',
      documentation: 'Disbursement currency'
    },
    {
      class: 'Float',
      name: 'originalTargetAmount',
      documentation: 'Original total amount in target currency in this batch. Available when distributeMode = 1'
    },
    {
      class: 'Float',
      name: 'realTargetAmount',
      documentation:
        `Real total amount in target currency to be disbursed in this batch after preprocessing
         Available when distributeMode = 1; or when distributeMode = 0 and rate is available`
    },
    {
      class: 'Int',
      name: 'originalCount',
      documentation: 'Original instructions count in this batch'
    },
    {
      class: 'Float',
      name: 'rate',
      documentation:
        `FX rate, available only when FX rate is the rate at the time of receiving instruction
        file per business agreement when merchant fund in foreign currencies to LianLian Pay
        onshore bank account.`
    }
  ]
});
