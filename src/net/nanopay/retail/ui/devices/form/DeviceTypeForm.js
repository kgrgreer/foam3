foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceTypeForm',
  extends: 'foam.u2.View',

  documentation: 'Form for just the device type.',

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
          overflow: scroll;
        }

        ^ .deviceTypeOption {
          box-sizing: border-box;
          position: relative;
          vertical-align: top;
          width: 80px;
          height: 80px;
          background-color: #FFFFFF;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
        }

        ^ .deviceTypeOption.selected {
          border: solid 1px #1CC2B7;
        }

        ^ .deviceTypeOption:hover {
          cursor: pointer;
          background-color: #f1f1f1;
        }

        ^ .imageCenter {
          display: block;
          margin: auto;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        ^ .optionSpacer {
          margin-right: 40px;
          display: inline-block;
        }

        ^ .optionSpacer:last-child {
          margin-right: 0;
        }

        ^ .optionTitleContainer {
          display: inline-block;
          width: 80px;
          height: 16px;
          margin-right: 40px;
        }

        ^ .optionTitleContainer:last-child {
          margin-right: 0;
        }

        ^ .optionTitle {
          margin: auto;
          width: fit-content;
          font-size: 10px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #8F8F8F;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step',             message: 'Step 2: Select your device type.' },
    { name: 'DeviceTypeLabel',  message: 'Device Type *' },
    { name: 'Instructions',     message: 'Please download the merchant app (tablets only) for iOS or Android if you don\'t already have one.' },
    { name: 'Error',            message: 'Device type required.' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'selectedOption',
      value: -1,
      postSet: function(oldValue, newValue) {
        this.viewData.selectedOption = newValue;
      },
      validateObj: function(selectedOption) {
        if ( selectedOption == -1 ) return this.Error;
      }
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();

      if ( ! this.viewData.selectedOption ) { return; }
      this.selectedOption = this.viewData.selectedOption;
    },

    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('div').addClass('row')
          .start('p').addClass('inputFieldLabel').add(this.DeviceTypeLabel).end()
          .start('p')
            .addClass('pDefault')
            .addClass('inputErrorLabel')
            .add(this.slot(this.SELECTED_OPTION.validateObj))
        .end()

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('div').addClass('deviceTypeOption').addClass('optionSpacer')
            .addClass(self.selectedOption$.map(function(o) { return o == 1 ? 'selected' : ''; }))
            .start({class: 'foam.u2.tag.Image', data: 'ui/images/apple.svg'}).addClass('imageCenter').end()
            .on('click', function(){
              self.selectedOption = 1;
            })
          .end()
          .start('div').addClass('deviceTypeOption').addClass('optionSpacer')
            .addClass(self.selectedOption$.map(function(o) { return o == 2 ? 'selected' : ''; }))
            .start({class: 'foam.u2.tag.Image', data: 'ui/images/android.svg'}).addClass('imageCenter').end()
            .on('click', function(){
              self.selectedOption = 2;
            })
          .end()
          .start('div').addClass('deviceTypeOption').addClass('optionSpacer')
            .addClass(self.selectedOption$.map(function(o) { return o == 3 ? 'selected' : ''; }))
            .start({class: 'foam.u2.tag.Image', data: 'ui/images/ingenico.svg'}).addClass('imageCenter').end()
            .on('click', function(){
              self.selectedOption = 3;
            })
          .end()
        .end()
        .start('div').addClass('row')
          .start('div').addClass('optionTitleContainer')
            .start('p').addClass('optionTitle').add('Apple').end()
          .end()
          .start('div').addClass('optionTitleContainer')
            .start('p').addClass('optionTitle').add('Android').end()
          .end()
          .start('div').addClass('optionTitleContainer')
            .start('p').addClass('optionTitle').add('Ingenico').end()
          .end()
        .end()
        .start('div').addClass('row')
          .start('p').addClass('pDefault').add(this.Instructions).end()
        .end()
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        var self = this;
        this.errors = this.errors_;
      }
    }
  ]
});
