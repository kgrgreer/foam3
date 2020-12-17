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
  package: 'net.nanopay.partner.treviso.api',
  name: 'RmUser',

  properties: [
    {
      class: 'Int',
      name: 'id_user',
      shortName: 'id_user',
      documentation: 'Backoffice user id that will be RM user'
    },
    {
      class: 'String',
      name: 'login',
      shortName: 'login',
      documentation: 'Login of the backoffice user who will be the RM user'
    }
  ]
});
