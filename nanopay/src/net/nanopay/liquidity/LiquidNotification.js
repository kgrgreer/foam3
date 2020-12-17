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
  package: 'net.nanopay.liquidity',
  name: 'LiquidNotification',
  extends: 'foam.nanos.notification.Notification',

  documentation: 'Liquid specific notification model.',

  properties: [
    {
      class: 'String',
      name: 'action',
      documentation: 'Action that was performed.'
    },
    {
      class: 'String',
      name: 'entity',
      documentation: 'Entity that was acted upon.'
    },
    {
      class: 'String',
      name: 'initiationDescription',
      documentation: 'Description of the action that took place and by whom',
      expression: (createdBy, action, entity) => {
        this.__subContext__.userDAO.find(createdBy)
          .then((user) => {
            return user.getFirstName() + ' ' + user.getLastName() + action + 'd a ' + entity.toLowerCase();
          });
      },
      transient: true
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Truncated summary description.'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'approvalStatus',
      documentation: 'Enum representing approval status.'
    }
  ]
});
