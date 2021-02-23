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
  package: 'net.nanopay.auth',
  name: 'LoginAttempt',

  documentation: `Record of login attempt, including IP address`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.medusa.Clusterable'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    {
      name: 'ipAddress',
      label: 'IP Address',
      class: 'String',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'loginIdentifierLegacy',
      documentation: `The legacy email identifier used for login.`,
      visibility: 'HIDDEN',
      storageTransient: true,
      shortName: 'email',
      javaPostSet: `
        if ( ! foam.util.SafetyUtil.isEmpty(val) ) {
          setLoginIdentifier(val);
        }
      `
    },
    {
      class: 'String',
      name: 'loginIdentifier',
      label: 'Login Identifier',
      documentation: 'The username or email address that was used in the login attempt.',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'loginAttemptedFor',
      label: 'User ID',
      documentation: 'User for whom login was attempted',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'group',
      documentation: 'group for user whose login was attempted'
    },
    {
      name: 'loginSuccessful',
      class: 'Boolean',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        this
          .start('span')
            .style({ color: value ? 'green' : 'red' })
            .add(value ? 'Yes' : 'No')
          .end();
      }
    },
    {
      class: 'Boolean',
      name: 'clusterable',
      value: true,
      visibility: 'HIDDEN',
      storageTransient: true,
      clusterTransient: true
    }
  ]
});
