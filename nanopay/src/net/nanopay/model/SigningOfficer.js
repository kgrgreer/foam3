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

  messages: [
    { name: 'UNDER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'position'
    },
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      name: 'birthday',
      label: 'Date of birth'
    }),
    {
      class: 'Reference',
      name: 'business',
      targetDAOKey: 'businessDAO',
      of: 'net.nanopay.model.Business',
      documentation: 'Associated business'
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
