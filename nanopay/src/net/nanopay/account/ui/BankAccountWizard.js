foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'BankAccountWizard',
  extends: 'foam.u2.detail.WizardSectionsView',

  css: `
    ^ .foam-u2-detail-SectionedDetailView .inner-card {
      padding: 0px;
    }
    ^ .foam-u2-borders-CardBorder {
      border-radius: 0px;
      box-shadow: none;
      border: none;
    }
    ^ .link {
      display: none;
    }
    ^ .checkBoxText {
      font-size: 10px;
      color: /*%GREY1%*/ #8e9090;
    }
    ^ .net-nanopay-documents-AcceptanceDocumentUserInputView .checkBox {
      display: none;
    }
    ^ input {
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
      color: /*%GREY2%*/ #8e9090;
    }
  `,

  messages: [
    { name: 'SUCCESS', message: 'Bank account successfully added.' },
    { name: 'ERROR', message: 'Bank account error occured.' }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          })).addClass(this.myClass('wizard-body'))
          .startContext({ data: this })
            .start(self.Cols).addClass(this.myClass('footer'))
              .add(this.PREV)
              .add(this.NEXT)
              .add(this.SUBMIT)
            .end()
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'submit',
      label: 'I agree',
      isEnabled: function(data$errors_) {
        return ! data$errors_;
      },
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) {
        await X.data.data.save();
        X.closeDialog();
      }
    }
  ]
});
