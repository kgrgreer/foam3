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
  package: 'net.nanopay.model',
  name: 'Branch',
  // relationship: Institution
  documentation: 'Bank/Institution Branch Information.',

  requires: [
    'foam.nanos.auth.Address'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
   },
    {
      class: 'String',
      name: 'branchId',
      required: true,
      documentation: 'Institution Branch identifier - such' +
          ' as the Indian Financial System Code.',
    },
    {
      class: 'String',
      name: 'clearingSystemIdentification',
      documentation: 'Clearing system identifier.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Bank branch address',
      factory: function() {
        return this.Address.create();
      },
    }
  ]
});
