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
  package: 'net.nanopay.account.ui',
  name: 'BankAccountWizard',
  extends: 'foam.u2.detail.WizardSectionsView',

  imports: [
    'stack'
  ],

  css: `
    ^ .foam-u2-detail-SectionedDetailView .inner-card {
      padding: 0px;
    }
    ^ .foam-u2-borders-CardBorder {
      border-radius: 0px;
      box-shadow: none;
      border: none;
    }
    ^ .checkBoxText {
      font-size: 10px;
      color: /*%GREY1%*/ #5e6061;
    }
    ^ .net-nanopay-documents-AcceptanceDocumentUserInputView .checkBox {
      display: none;
    }
    ^ input:not([type="checkbox"]) {
      width: 100%;
    }
    ^ .foam-u2-layout-Cols {
      justify-content: flex-end;
    }
    ^ .net-nanopay-account-ui-BankAccountWizard-footer {
      border: none;
      padding: 0px;
    }
    ^ .sectioned-detail-property-supportingDocuments m3 {
      color: /*%GREY2%*/ #9ba1a6;
    }
  `,

  messages: [
    { name: 'SUCCESS', message: 'Bank account successfully added' },
    { name: 'ERROR', message: 'Bank account error occured' },
    { name: 'CREATE_TITLE', message: 'Add Bank Account' },
    { name: 'EDIT_TITLE', message: 'Edit Bank Account' }
  ],

  properties: [
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      class: 'String',
      name: 'customTitle'
    }
  ],

  methods: [
    function init() {
      this.data.clientAccountInformationTitle = this.customTitle ? this.customTitle : this.CREATE_TITLE;
      if ( this.controllerMode == foam.u2.ControllerMode.EDIT ) {
        this.data.clientAccountInformationTitle = this.EDIT_TITLE;
      }
    },
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$,
                config: self.config
              });
          })).addClass(this.myClass('wizard-body'))
          .startContext({ data: this })
            .start(self.Cols).addClass(this.myClass('footer'))
              .add(this.PREV)
              .add(this.NEXT)
              .tag(this.SUBMIT, { buttonStyle: 'PRIMARY' })
            .end()
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'submit',
      isEnabled: function(currentIndex,
                          data$errors_,
                          data$padCapture$address$errors_,
                          data$padCapture$capablePayloads,
                          data$padCapture$capabilityIds,
                          ) {
        if ( data$errors_ || data$padCapture$address$errors_ ) return false;

        if ( data$padCapture$capabilityIds && data$padCapture$capabilityIds.length > data$padCapture$capablePayloads.length) return false;
        
        if ( data$padCapture$capablePayloads ) {
          for ( payload of data$padCapture$capablePayloads ) {
            if ( ! data$padCapture$capabilityIds.includes(payload.capability) && (! payload.data || ! payload.data.agreement) ) return false;
          }
        }

        return true;
      },
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) {
        await X.data.data.save(false);
        X.closeDialog();

        // redirect to bank account lists view if you added a bank account
        // on BankPickCurrencyView
        const curView = this.stack.stack_[this.stack.pos]; // top view on the stack
        if ( curView[0].class === 'net.nanopay.bank.ui.BankPickCurrencyView' ) {
          this.stack.back();
        }
      }
    }
  ]
});
