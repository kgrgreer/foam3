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
  package: 'net.nanopay.sps',
  name: 'SPSTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'String',
      name: 'batchId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'itemId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'approvalCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'settlementResponse',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'settleDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'achRequest',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'achRequestDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'rejectReason',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'chargebackTime',
      visibility: 'RO'
    }
  ]
});
