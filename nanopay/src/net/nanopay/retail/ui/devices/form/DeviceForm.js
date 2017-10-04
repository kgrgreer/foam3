
foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a device',

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code}),
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ p {
        margin: 0;
        font-size: 12px;
        color: #093649;
        line-height: 1.33;
      }

      ^ .stepRow {
        margin-bottom: 40px;
      }

      ^ .instructionsRow {
        margin-bottom: 40px;
      }

      ^ input {
        width: 220px;
        height: 40px;
        box-sizing: border-box;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        padding-left: 15px;
        padding-right: 15px;
        outline: none;
      }

      ^ input:focus {
        border: solid 1px #59a5d5;
      }

      ^ .inputFieldLabel {
        display: inline-block;
        margin-right: 20px;
        vertical-align: top;
        margin-bottom: 8px;
      }

      ^ .inputErrorLabel {
        display: inline-block;
        color: red !important;
        vertical-align: top;
      }
    */}})
  ],

  methods: [
    function init() {
      this.title = 'Add a Device';
      // this.isCustomNavigation = true;
      this.views = [
        { parent: 'addDevice', id: 'form-addDevice-name',     label: 'Name',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceNameForm' } },
        { parent: 'addDevice', id: 'form-addDevice-type',     label: 'Type',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceTypeForm' } },
        { parent: 'addDevice', id: 'form-addDevice-serial',   label: 'Serial #',  view: { class: 'net.nanopay.retail.ui.devices.form.DeviceSerialForm' } },
        { parent: 'addDevice', id: 'form-addDevice-password', label: 'Password',  view: { class: 'net.nanopay.retail.ui.devices.form.DevicePasswordForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        return true;
      },
      code: function(X) {
        if ( this.position == 2 ) { // On Device Serial Number Screen. This is when we should make API call
          //TODO: MAKE API CALL TO ADD DEVICE
            // TODO: CHECK IF SUCCESS OR FAILURE
            if ( true ) {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
              return;
            }
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          X.stack.back();
          return;
        }

        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    }
  ]
});
