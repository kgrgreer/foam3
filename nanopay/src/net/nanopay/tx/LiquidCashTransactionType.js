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

foam.ENUM({
  package: 'net.nanopay.tx',
  name: 'LiquidCashTransactionType',

  documentation: 'Liquid transaction must have one of these to identify what they are for.',

  values: [
    {
      name: 'CASH',
      label: 'Cash Transaction',
      documentation: 'A cash Transaction',
      ordinal: 0
    },
    {
      name: 'MANUAL_SWEEP',
      label: 'Manual Sweep',
      documentation: 'A manual sweep',
      ordinal: 1
    },
    {
      name: 'AUTOMATED_SWEEP',
      label: 'Automated Sweep',
      documentation: 'An automated sweep',
      ordinal: 2
    },
    {
      name: 'FX_TRANSACTION',
      label: 'FX Transaction',
      documentation: 'A FX transaction',
      ordinal: 3
    },
    {
      name: 'LOAN_TRANSACTION',
      label: 'Loan Transaction',
      documentation: 'A Loan Transaction',
      ordinal: 4
    },
    {
      name: 'CICO',
      label: 'Cash in or Cash out',
      documentation: 'A CICO Transaction',
      ordinal: 5
    },
  ]
});
