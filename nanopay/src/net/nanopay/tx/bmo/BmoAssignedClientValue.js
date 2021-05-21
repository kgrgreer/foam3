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
  package: 'net.nanopay.tx.bmo',
  name: 'BmoAssignedClientValue',

  documentation: `Nanopay BMO account information`,

  properties: [
    {
      name: 'creditOriginatorId',
      class: 'String'
    },
    {
      name: 'debitOriginatorId',
      class: 'String'
    },
    {
      name: 'destinationDataCentre',
      class: 'String'
    },
    {
      name: 'originationControlDataAndIdentification',
      class: 'String'
    },
    {
      name: 'originatorShortName',
      class: 'String'
    },
    {
      name: 'originatorLongName',
      class: 'String'
    },
    {
      name: 'institutionIdForReturns',
      class: 'String'
    },
    {
      name: 'accountNumberForReturns',
      class: 'String'
    },
    {
      name: 'accountingInformation',
      class: 'String'
    },
    {
      name: 'fundingAccountNumber',
      class: 'String'
    },
    {
      name: 'accountNumberForRejects',
      class: 'String'
    },
    {
      name: 'accountNumberForRecalls',
      class: 'String'
    },
    {
      name: 'production',
      class: 'Boolean'
    },
    {
      name: 'transactionType',
      class: 'Int',
      documentation: 'Please see EFT_Client_Manual_CAN.pdf, Appendix B.'
    },
    {
      name: 'fileCreationNumberOffset',
      class: 'Int'
    }
  ]

});
