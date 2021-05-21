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
  name: 'SigningOfficer',
  documentation: `
    A signing officer is a person that can act on behalf of the company.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
      documentation: 'First name'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Last name'
    },
    {
      class: 'String',
      name: 'position',
      documentation: 'Position'
    },
    {
      class: 'String',
      name: 'source',
      documentation: 'Where the signing officer was added from',
      externalTransient: true
    },
    {
      class: 'Reference',
      name: 'user',
      targetDAOKey: 'userDAO',
      of: 'foam.nanos.auth.User',
      documentation: 'User that is the signing officer'
    },
  ]
});
