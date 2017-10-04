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
