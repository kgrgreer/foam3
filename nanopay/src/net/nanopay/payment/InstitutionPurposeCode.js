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
  package: 'net.nanopay.payment',
  name: 'InstitutionPurposeCode',
  documentation: 'Institution specific Transaction Purpose Code.' +
      ' Mapped from Institution/Processor and Transaction Purpose Code',

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    // { via RELATIONSHIP
    //   class: 'Reference',
    //   of: 'net.nanopay.tx.TransactionPurpose',
    //   name: 'transactionPurposeId',
    //   label: 'Transaction Purpose'
    // },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institutionId',
      documentation: 'Reference to institution associated to purpose code.',
      label: 'Institution'
    },
    {
      class: 'String',
      documentation: 'Body of text explaining the purpose code.',
      name: 'code'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.TxnProcessor',
      name: 'txnProcessorId',
      label: 'Payment Platform',
      documentation: 'Platform specifying purpose code.'
    }
  ]
});
