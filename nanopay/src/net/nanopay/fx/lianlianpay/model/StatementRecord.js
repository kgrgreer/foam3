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
  name: 'StatementRecord',

  documentation: 'Represents a statement record',

  properties: [
    {
      class: 'String',
      name: 'serialNumber',
      documentation: 'Unique identity per each fund in / out'
    },
    {
      class: 'String',
      name: 'billTime',
      documentation: 'Fund billing time. Format is YYMMDDHHMMSS'
    },
    {
      class: 'Int',
      name: 'type',
      documentation: 'Transaction type of each fund in / out'
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency type'
    },
    {
      class: 'Float',
      name: 'amount',
      documentation: 'Fund in / out amount, fund out amount with negative number'
    },
    {
      class: 'String',
      name: 'memo',
      documentation: 'Description of the fund in / out',
      required: false
    }
  ]
});