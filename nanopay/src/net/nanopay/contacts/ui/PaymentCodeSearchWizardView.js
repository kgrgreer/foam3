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
  package: 'net.nanopay.contacts.ui',
  name: 'PaymentCodeSearchWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    Lets the user add public and private companies as contacts using
    payment codes.
  `,

  imports: [
    'ctrl',
    'user',
    'paymentCodeService'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.contacts.Contact',
    'foam.mlang.sink.Count'
  ],

  css: `
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
  `,

  messages: [
    { name: 'CONTACT_ADDED', message: 'Contact added successfully' },
    { name: 'CONTACT_EXISTS_ERROR', message: 'Contact with this payment code already exists' },
  ],

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
      this.addClass('wizard');
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass('section-container')
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass('button-container')
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
      this.ctrl.notify(this.CONTACT_ADDED, '', this.LogLevel.INFO, true);
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
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
          X.pushMenu('sme.menu.toolbar');
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
          var business = await this.paymentCodeService.getPublicBusinessInfo(X, paymentCodeValue);
          // check if contact associated with given payment code already exists
          var sink = await this.user.contacts.where(this.EQ(this.Contact.BUSINESS_ID, business.id)).select(this.Count.create());
          if ( sink.value != 0 ) {
            this.ctrl.notify(this.CONTACT_EXISTS_ERROR, '', this.LogLevel.ERROR, true);
            return;
          }
          // copy over contact properties
          contact.copyFrom({
            organization: business.organization,
            operatingBusinessName: business.operatingBusinessName,
            businessId: business.id,
            address: business.address
          });
          // set confirmation display properties
          contact.businessSectorId = business.businessSectorId;
          contact.paymentCodeValue = paymentCodeValue;
          this.currentIndex = this.nextIndex;
        } catch (err) {
          var msg = err.message;
          this.ctrl.notify(msg, '', this.LogLevel.ERROR, true);
        }
      }
    },
    {
      name: 'save',
      label: 'Add Contact',
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) { 
        if ( ! await this.addContact() ) return;
        X.closeDialog();
      }
    }
  ]
});