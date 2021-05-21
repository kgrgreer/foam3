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
  package: 'net.nanopay.retail.ui.devices',
  name: 'DeviceCTACard',
  extends: 'net.nanopay.ui.NotificationActionCard',

  documentation: 'Card that would display an alert that would prompt the user to activate a device.',

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.NotificationActionCard.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [
    [ 'title',    'Activate a new device.' ],
    [ 'subtitle', "You don't have any devices yet. You need to activate a device in order to view the transactions." ]
  ],

  actions: [
    {
      name: 'actionButton',
      label: 'Activate A Device',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.retail.ui.devices.form.DeviceForm' });
      }
    }
  ]
});
