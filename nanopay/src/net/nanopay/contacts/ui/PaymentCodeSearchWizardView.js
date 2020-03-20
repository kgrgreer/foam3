foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'PaymentCodeSearchWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: `
    Lets user add internal contact using a paymentcode.
  `,

  imports: [
    'ctrl',
    'user',
    'businessFromPaymentCode'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^section-container {
      padding: 24px 24px 32px;
    }
    .my-payment-code-container{
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-bottom: 240px;
    }
    .my-payment-code-title{
      display: flex;
      justify-content: center;
      align-items: center;
      width: 113px;
      height: 26px;
      border-radius: 3px;
      border: solid 0.5px #979797;
      background-color: #e2e2e3;
      font-size: 12px;
      line-height: 1.5;
      color: #8e9090;
      margin-right: 8px;
    }
    .my-payment-code-value{
      font-size: 12px;
      line-height: 1.5;
      color: #8e9090;
    }
    ^button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    .net-nanopay-sme-ui-AbliiActionView-tertiary:focus:not(:hover),
    .net-nanopay-sme-ui-AbliiActionView-primary:focus:not(:hover) {
      border-color: transparent;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass(self.myClass('section-container'))
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass(this.myClass('button-container'))
              .tag(this.BACK, { buttonStyle: 'TERTIARY' })
              .start(this.NEXT).end()
              .start(this.SAVE).end()
            .end()
          .endContext()
        .end();
    },
    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;
      try {
      contact = await this.user.contacts.put(this.data.contact);
      this.ctrl.notify(this.CONTACT_ADDED);
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, 'error');
        this.isConnecting = false;
        return false;
      }
      this.isConnecting = false;
      return true;
    },
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        if ( this.currentIndex > 0 ) {
          this.currentIndex = this.prevIndex;
        } else {
          //How do i get back to MenuToolBar??
          X.pushMenu('sme.main.contacts');
          X.closeDialog();
        }
      }
    },
    {
      name: 'next',
      label: 'Next',
      isAvailable: function(nextIndex) {
        return nextIndex !== -1;
      },
      code: async function(X) { 
        let { paymentCodeValue, contact } = this.data;
        try {
          var business = await this.businessFromPaymentCode.getPublicBusinessInfo(X, paymentCodeValue);
          // copy over contact properties
          contact.copyFrom({
            organization: business.organization,
            businessId: business.id,
            address: business.address
          });
          // set confirmation display properties
          contact.businessSectorId = business.businessSectorId;
          contact.operatingBusinessName = business.operatingBusinessName;
          contact.paymentCodeValue = paymentCodeValue;
          this.currentIndex = this.nextIndex;
        } catch (err) {
          var msg = err.message;
          this.ctrl.notify(msg, 'error');
        }
      }
    },
    {
      name: 'save',
      label: 'Save',
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) { 
        if ( ! await this.addContact() ) return;
        X.pushMenu('sme.main.contacts');
        X.closeDialog();
      }
    }
  ]
});