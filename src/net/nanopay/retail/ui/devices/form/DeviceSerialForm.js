foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceSerialForm',
  extends: 'foam.u2.View',

  documentation: 'Form for just the device serial number.',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  exports: [ 'as data' ],

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
    { name: 'Instructions', message: 'Open the MintChip merchant app on your device and enter the 15 alphanumeric serial code displayed on the screen of the device. Do not use spaces.' },
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
        if ( ! /^[a-zA-Z0-9]{15}$/.exec(serialNumber) ) return this.Error;
      }
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();

      if ( ! this.viewData.serialNumber ) { return; }
      this.serialNumber = this.viewData.serialNumber;
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.Instructions).end()
        .start('div').addClass('row')
          .start('p').addClass('inputFieldLabel').add(this.SerialLabel).end()
          .start('p')
            .addClass('pDefault')
            .addClass('inputErrorLabel')
            .addClass(this.errors_$.map(function(e) { return e ? 'active' : ''; }))
            .add(this.Error).end()
        .end()
        .tag(this.SERIAL_NUMBER, {onKey: true})
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
});
