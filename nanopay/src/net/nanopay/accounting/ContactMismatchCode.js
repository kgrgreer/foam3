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
  package: 'net.nanopay.accounting',
  name: 'ContactMismatchCode',

  documentation: 'Codes for contact mismatch pairs',

  values: [
    { name: 'EXISTING_CONTACT', documentation: 'There is an existing contact with same email as the imported one.' },
    { name: 'EXISTING_USER', documentation: 'Existing user on Ablii.' },
    { name: 'EXISTING_USER_MULTI', documentation: 'When import the contact, the contact is already an existing user that belongs to multiple businesses.' },
    { name: 'EXISTING_USER_CONTACT', documentation: 'When import the contact, the contact is already an existing contact that is also a user on Ablii.' },
    { name: 'SUCCESS', documentation: 'Successful contact sync' }
  ]
});
