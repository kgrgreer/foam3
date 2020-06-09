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
  name: 'InternationalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    // TODO/REVIEW: this should just use referenceNumber
    // {
    //   class: 'Long',
    //   name: 'impsReferenceNumber',
    //   label: 'IMPS Reference Number',
    //   visibility: 'RO'
    // },
    {
      // class: 'FObjectProperty',
      class: 'Reference',
      of: 'net.nanopay.tx.TransactionPurpose',
      name: 'purpose',
      label: 'Purpose',
      visibility: 'RO',
      documentation: 'Transaction purpose'
    },
  ]
});
