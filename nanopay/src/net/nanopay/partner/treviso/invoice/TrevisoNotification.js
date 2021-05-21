/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.partner.treviso.invoice',
  name: 'TrevisoNotification',
  extends: 'foam.nanos.notification.Notification',

  requires: [
    'net.nanopay.partner.treviso.invoice.TrevisoNotificationRule'
  ],

  javaImports: [
    'net.nanopay.partner.treviso.invoice.TrevisoNotificationRule'
  ],

  properties: [
    {
      class: 'String',
      name: 'amount'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        return TrevisoNotificationRule.TED_TEXT_MSG.replace("{amount}", getAmount());
      `,
      getter: function() {
        return this.TrevisoNotificationRule.TED_TEXT_MSG.replace('{amount}', this.amount);
      }
    }
  ]
});
