foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceNameForm',
  extends: 'net.nanopay.ui.wizardView.WizardSubView',

  documentation: 'Form for just the device name.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{

        }
      */}
    })
  ],

  messages: [
    { name: 'Step',         message: 'Step 1: Name your device.' },
    { name: 'Instructions', message: 'Please name your device to help distinguish it among other devices.\nYou can change the name at any time.' },
    { name: 'NameLabel',    message: 'Name *' },
    { name: 'Error',        message: 'Invalid name used.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'deviceName',
      postSet: function(oldValue, newValue) {
        this.viewData.name = newValue;
      },
      validateObj: function(deviceName) {
        if ( deviceName.trim().length == 0 ) return this.Error;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      if ( ! this.viewData.name ) { return; }
      this.deviceName = this.viewData.name
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions).end()
        .start('div').addClass('row')
          .start('p').addClass('inputFieldLabel').add(this.NameLabel).end()
          .start('p')
            .addClass('pDefault')
            .addClass('inputErrorLabel')
            .add(this.slot(this.DEVICE_NAME.validateObj))
        .end()
        .tag(this.DEVICE_NAME, {onKey: true})
    }
  ]
});
