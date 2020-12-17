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
  name: 'SPSSettlementFileRecord',

  properties: [
    {
      class: 'String',
      name: 'TID',
    },
    {
      class: 'String',
      name: 'Transaction_Date_Time'
    },
    {
      class: 'String',
      name: 'Item_ID'
    },
    {
      class: 'String',
      name: 'Phone'
    },
    {
      class: 'String',
      name: 'Check_Num'
    },
    {
      class: 'String',
      name: 'Amount'
    },
    {
      class: 'String',
      name: 'Credit_Debit'
    },
    {
      class: 'String',
      name: 'Del'
    },
    {
      class: 'String',
      name: 'E_P'
    },
    {
      class: 'String',
      name: 'Type'
    },
    {
      class: 'String',
      name: 'Response'
    },
    {
      class: 'String',
      name: 'Invoice'
    },
    {
      class: 'String',
      name: 'Customer'
    },
    {
      class: 'String',
      name: 'Batch_ID'
    },
    {
      class: 'String',
      name: 'Settle_Date'
    },
    {
      class: 'String',
      name: 'Chargeback'
    },
    {
      class: 'String',
      name: 'Store_Num'
    },
    {
      class: 'String',
      name: 'Ach_Request'
    },
    {
      class: 'String',
      name: 'Ach_Request_Date'
    },
    {
      class: 'String',
      name: 'Account_Type_C_S'
    },
    {
      class: 'String',
      name: 'SEC_Code'
    }
  ]
});
