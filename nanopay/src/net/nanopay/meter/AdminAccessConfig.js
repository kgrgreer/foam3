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
  package: 'net.nanopay.meter',
  name: 'AdminAccessConfig',

  properties: [
    {
      class: 'List',
      name: 'adminUserIds',
      documentation: 'List of user ids that will keep admin access.',
      javaType: 'java.util.ArrayList<java.lang.Long>',
      view: {
        class: 'foam.u2.view.ReferenceArrayView',
        daoKey: 'userDAO'
      }
    },
    {
      class: 'String',
      name: 'opSupportGroup',
      value: 'operations-support',
      documentation: `All users not in adminUsers array with admin 
                      access will be moved to this group.`
    }
  ]
});
