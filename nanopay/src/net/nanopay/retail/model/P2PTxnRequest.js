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
  package: 'net.nanopay.retail.model',
  name: 'P2PTxnRequest',
  documentation: `This is the request object that is created when a peer request money from another peer.`,

  tableColumns: [
    'id', 'requestorEmail', 'requesteeEmail', 'dateRequested', 'amount'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50,
      visibility: 'RO',
    },
    {
      class: 'EMail',
      name: 'requestorEmail',
      label: `Requestor's Email`,
      visibility: 'RO',
    },
    {
      class: 'EMail',
      name: 'requesteeEmail',
      label: `Requestee's email`,
      visibility: 'RO',
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'requestor',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'requestee',
      storageTransient: true
    },
    {
      class: 'DateTime',
      name: 'dateRequested',
      label: 'Date Requested'
    },
    {
      class: 'DateTime',
      name: 'lastUpdated',
      label: 'Last Updated',
    },
    {
      class: 'UnitValue',
      name: 'amount',
      label: 'Amount',
      visibility: 'RO',
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.P2PTxnRequestStatus',
      name: 'status'
    }
  ]

});
