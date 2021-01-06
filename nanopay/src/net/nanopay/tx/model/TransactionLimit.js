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
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimit',

  documentation: 'Pre-defined limit for transactions.',

  ids: [ 'name', 'timeFrame', 'type' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Transaction limit name.',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitType',
      name: 'type',
      documentation: 'Transaction limit type. (Send or Receive)',
      gridColumns: 6
    },
    {
      class: 'UnitValue',
      name: 'amount',
      documentation: 'Transaction limit amount.',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
      name: 'timeFrame',
      documentation: 'Transaction limit time frame. (Day, Week etc.)',
      gridColumns: 6
    }    
  ]
});
