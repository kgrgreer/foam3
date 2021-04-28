/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'PartnerReport',
  extends: 'net.nanopay.country.br.tx.PartnerLineItem',
  documentation: 'Report model',

  properties: [
    {
      name: 'clientName',
      class: 'String'
    },
    {
      class: 'Long',
      name: 'clientId'
    },
    {
      name: 'beneficiaryName',
      class: 'String'
    },
    {
      class: 'Long',
      name: 'beneficiaryId'
    },
    {
      name: 'spid',
      class: 'String'
    },
    {
      name: 'transactionId',
      class: 'String'
    },
    {
      class: 'UnitValue',
      name: 'principleAmount',
      label: 'Principle Amount',
      unitPropName: 'principleCurrency'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'principleCurrency',
      label: 'Principle Currency',
      targetDAOKey: 'currencyDAO'
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      unitPropName: 'destinationCurrency',
      label: 'Destination Amount'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'destinationCurrency',
      label: 'Destination Currency',
      targetDAOKey: 'currencyDAO'
    },
    {
      name: 'tradeNumber',
      class: 'Long'
    },
    {
      class: 'DateTime',
      name: 'tradeDate'
    },
    {
      class: 'DateTime',
      name: 'valueDate',
    }
  ]
});
