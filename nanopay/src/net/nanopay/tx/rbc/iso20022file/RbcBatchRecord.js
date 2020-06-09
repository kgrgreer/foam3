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
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcBatchRecord',

  documentation: `RBC Batch`,

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'batchCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'batchControl',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcBatchControl',
    },
    {
      name: 'ciRecords',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcCIRecord'
    },
    {
      name: 'coRecords',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcCORecord'
    },
  ],
});
