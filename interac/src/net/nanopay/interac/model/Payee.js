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
  package: 'net.nanopay.interac.model',
  name: 'Payee',
  documentation: 'Transaction recipient',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name:  'nationalId'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name:  'phone'
    },
    {
      class: 'PhoneNumber',
      name:  'phoneNumber'
    },
    {
      class: 'Boolean',
      name: 'phoneNumberVerified',
      writePermissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name:  'address'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name:  'account'
    }
  ]
});
