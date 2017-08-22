
foam.CLASS({
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DeviceForm',
  extends: 'net.nanopay.retail.ui.shared.wizardView.WizardView',

  documentation: 'Pop up that extends WizardView for adding a device',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {
        net.nanopay.retail.ui.shared.wizardView.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code;
      }
    })
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isEnabled: function(position) {
        return position == this.viewTitles.length - 1 || position == 0 ? false : true;
      },
      code: function() {
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        console.log(errors);
        if ( errors ) return false; // Error present
        if ( position < this.views.length - 1 ) return true; // Valid next
        if ( position == this.views.length - 1 && this.inDialog) return true; // Last Page & in dialog
        return false; // Not in dialog
      },
      code: function() {
        if ( this.position == 2 ) { // On Device Serial Number Screen. This is when we should make API call
          //TODO: MAKE API CALL TO ADD DEVICE
            // TODO: CHECK IF SUCCESS OR FAILURE
            if ( true ) {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
              return;
            }
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          if ( this.inDialog ) this.closeDialog();
          return;
        }

        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    }
  ]
})
