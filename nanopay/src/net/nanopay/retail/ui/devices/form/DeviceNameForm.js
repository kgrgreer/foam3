foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceNameForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for just the device name.',

  messages: [
    { name: 'Step',         message: 'Step 1: Name your device.' },
    { name: 'Instructions', message: 'Please name your device to help distinguish it among other devices.' },
    { name: 'NameLabel',    message: 'Name *' }
  ],

  properties: [
    {
      class: 'String',
      name: 'deviceName',
      factory: function () {
        return this.viewData.deviceName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.deviceName = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('stepRow')
          .start('p').add(this.Step).end()
        .end()
        .start('p').addClass('instructionsRow').add(this.Instructions).end()
        .start('div').addClass('row')
          .start().addClass('infoLabel').add(this.NameLabel).end()
            .start(this.DEVICE_NAME).end()
          .end()
        .end()
    }
  ]
});
