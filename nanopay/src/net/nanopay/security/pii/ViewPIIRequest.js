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
  package: 'net.nanopay.security.pii',
  name: 'ViewPIIRequest',

  documentation: `Modelled PII Request`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  searchColumns: [
    'viewRequestStatus'
   ],

  tableColumns: [
    'id',
    'createdBy.firstName',
    'createdBy.lastName',
    'approvedBy.firstName',
    'approvedBy.lastName'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the request'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent who created the request'
    },
    {
      name: 'created',
      class: 'DateTime',
    },
    {
      name: 'reportIssued',
      class: 'Boolean'
    },
    {
      name: 'viewRequestStatus',
      class: 'Enum',
      of: 'net.nanopay.security.pii.PIIRequestStatus',
      value: 'PENDING'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approvedBy',
      documentation: 'Id of user that Approved the request'
    },
    {
      name: 'approvedAt',
      class: 'DateTime',
      documentation: 'Time at which the request was approved'
    },
    {
      name: 'requestExpiresAt',
      class: 'DateTime',
    },
    {
      class: 'List',
      name: 'downloadedAt',
      documentation: 'List that holds times at which the report was downloaded',
      javaType: 'java.util.ArrayList<java.util.Date>'
    }
  ]
});
