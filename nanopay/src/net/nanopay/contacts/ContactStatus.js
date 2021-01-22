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
  package: 'net.nanopay.contacts',
  name: 'ContactStatus',

  documentation: `The base model for tracking the registration status of a
    Contact.  A Contact is defined as a person who is not registered on the
    platform, but can still receive invoices from platform users.
  `,

  values: [
    {
      name: 'PENDING',
      label: { en: 'Pending', pt: 'Pendente'},
      documentation: 'Default Status',
      ordinal: 0,
      color: '/*%GREY3%*/ #cbcfd4'
    },
    {
      name: 'CONNECTED',
      label: { en: 'Connected', pt: 'Conectado'},
      documentation: 'Added via payment code or business name',
      ordinal: 1,
      color: '#07941f'
    },
    {
      name: 'READY',
      label: { en: 'Ready', pt: 'Pronto'},
      documentation: 'Either business id or bankAccount associated',
      ordinal: 2,
      color: '/*%APPROVAL3%*/ #32bf5e'
    }
  ]
});
