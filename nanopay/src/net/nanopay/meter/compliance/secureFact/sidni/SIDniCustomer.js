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
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniCustomer',

  documentation: `The Customer object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'custTransactionId',
      documentation: 'Identifier for the transaction, used to check for duplicates, max length of 256.'
    },
    {
      class: 'String',
      name: 'userReference',
      required: true,
      documentation: 'Identifer for transaction from the customer.'
    },
    {
      class: 'Boolean',
      name: 'consentGranted',
      required: true,
      documentation: 'Specifies if the individual has consented to being searched.'
    },
    {
      class: 'String',
      name: 'language',
      required: true,
      documentation: 'Language in which responses will be provided. Currently only supports en-CA',
      value: 'en-CA'
    },
    {
      class: 'String',
      name: 'flinksLoginId',
      documentation: 'Flinks loginId, refer to doc before using.'
    },
  ]
});
