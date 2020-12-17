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
  name: 'Reconciliation',

  documentation: 'Represents a reconciliation',

  properties: [
    {
      class: 'Date',
      name: 'accountingDate',
      documentation: 'Accounting date, format is YYYMMDD'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.lianlianpay.model.ReconciliationRecord',
      name: 'reconciliationRecords',
      documentation: 'Array of reconciliation records'
    }
  ]
});