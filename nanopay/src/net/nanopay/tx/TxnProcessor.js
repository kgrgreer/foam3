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
  name: 'TxnProcessor',
  documentation: 'Transaction Processor information.',

  searchColumns: [],

  tableColumns: [
    'id',
    'name',
    'user.id',
    'enabled'
  ],

  constants: [
    {
      type: 'String',
      name: 'NONE',
      value: 'NONE',
    },
    {
      type: 'String',
      name: 'REALEX',
      value: 'REALEX',
    },
    {
      type: 'String',
      name: 'STRIPE',
      value: 'STRIPE',
    },
    {
      type: 'String',
      name: 'DWOLLA',
      value: 'DWOLLA',
    },
    {
      type: 'String',
      name: 'ALTERNA',
      value: 'ALTERNA',
    },
    {
      type: 'String',
      name: 'INTERAC',
      value: 'INTERAC',
    },
   ],

  properties: [
    {
      class: 'String',
      name: 'id',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      required: true
    },
    {
      class: 'String',
      name: 'abbreviation',
    },
    {
      class: 'String',
      name: 'description',
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'apiBaseUrl'
    },
    {
      documentation: 'Transaction Processor User account.',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      label: 'User'
    },
    {
      class: 'foam.core.FObjectProperty',
      name: 'fee',
      of: 'net.nanopay.tx.fee.Fee'
    }
  ]
});
