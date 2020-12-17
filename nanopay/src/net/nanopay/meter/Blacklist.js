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
  package: 'net.nanopay.meter',
  name: 'Blacklist',
  extends: 'foam.nanos.auth.Group',

  documentation: 'Blacklist entity associated to a users group',

  tableColumns: [
    'id',
    'description',
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 400
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the Blacklist'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.BlacklistEntityType',
      name: 'entityType',
      documentation: 'Entity type to distinguish Object'
    }
  ]
});
