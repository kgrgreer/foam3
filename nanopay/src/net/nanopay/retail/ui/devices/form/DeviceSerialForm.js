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
    { name: 'Step',         message: 'Step 3: Input the device\'s serial number.' },
    { name: 'Instructions', message: 'Open the MintChip merchant app on your device and enter the 16 alphanumeric serial code displayed on the screen of the device. Do not use spaces.' },
    { name: 'SerialLabel',  message: 'Serial # *' },
    { name: 'Error',        message: 'Invalid Serial Number used.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'serialNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.serialNumber = newValue.toUpperCase();
      },
      validateObj: function(serialNumber) {
        //Checks if the length is correct and if the value is alphanumerical
        if ( ! /^[a-zA-Z0-9]{16}$/.exec(serialNumber) ) return this.Error;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      if ( ! this.viewData.serialNumber ) { return; }
      this.serialNumber = this.viewData.serialNumber;
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('stepRow')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('instructionsRow').add(this.Instructions).end()
        .start('div')
          .start('p').addClass('inputFieldLabel').add(this.SerialLabel).end()
          .start('p')
            .addClass('pDefault')
            .addClass('inputErrorLabel')
            .add(this.slot(this.SERIAL_NUMBER.validateObj))
          .end()
        .end()
        .tag(this.SERIAL_NUMBER, {onKey: true, maxLength: 16})
    }
  ]
});
