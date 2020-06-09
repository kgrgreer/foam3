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
  name: 'Device',

  documentation: 'Devices used by merchants on the nanopay platform.',

  tableColumns: ['id', 'name', 'serialNumber', 'status'],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Device name.',
      required: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.DeviceType',
      name: 'type',
      documentation: 'Device Type. (iOS, Android, Ingenico etc.)'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.DeviceStatus',
      documentation: 'Device status determining it\'s capabilities.',
      name: 'status'
    },
    {
      class: 'String',
      name: 'serialNumber',
      label: 'Serial No.',
      documentation: 'Serial number associated to device.',
      required: true
    },
    {
      class: 'String',
      name: 'password',
      documentation: 'Device password.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      documentation: 'Device owner (User).'
    }
  ]
});
