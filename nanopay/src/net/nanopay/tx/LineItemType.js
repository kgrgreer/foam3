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
  name: 'LineItemType',
  implements: ['foam.nanos.auth.EnabledAware'],

  documentation: 'Type of service rendered',

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 50,
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
    },
    {
      class: 'String',
      name: 'name',
      required: true,
      documentation: 'Name of service or good classification.'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service or good.'
    },
    {
      class: 'String',
      name: 'taxCode'
    }
  ]
});
