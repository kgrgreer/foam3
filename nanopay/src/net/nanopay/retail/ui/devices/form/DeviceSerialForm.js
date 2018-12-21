foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceSerialForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for just the device serial number.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{

        }
      */}
    })
  ],

  messages: [
    { name: 'Step',         message: 'Step 2: Input the device\'s serial number.' },
    { name: 'Instructions', message: 'Open the Merchant App on your device and enter the 16 alphanumeric serial code displayed on the screen of the device.' },
    { name: 'SerialLabel',  message: 'Serial # *' }
  ],

  properties: [
    {
      class: 'String',
      name: 'serialNumber',
      factory: function () {
        return this.viewData.serialNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.serialNumber = newValue.toUpperCase();
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('stepRow')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('instructionsRow').add(this.Instructions).end()
        .start('div')
          .start().addClass('infoLabel').add(this.SerialLabel).end()
          .start('p')
            .addClass('pDefault')
            .start(this.SERIAL_NUMBER, {onKey: true, maxLength: 16}).end()
          .end()
        .end()
    }
  ]
});
