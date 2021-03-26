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

foam.ENUM({
  package: 'net.nanopay.bank',
  name: 'BankAccountStatus',

  documentation: 'The base model for tracking and managing the status of a bank account.',

  values: [
    {
      name: 'UNVERIFIED',
      label: 'Unverified',
      color: '#545d87'
    },
    {
      name: 'VERIFIED',
      label: 'Verified',
      color: '#2cab70'
    },
    {
      name: 'DISABLED',
      label: 'Disabled',
      color: '#f91c1c'
    }
  ]
});
