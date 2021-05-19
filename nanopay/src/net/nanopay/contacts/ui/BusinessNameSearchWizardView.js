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
  name: 'BusinessNameSearchWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',
  
  documentation: `
    Lets the user search public companies by their operating business names.
    If the business exists, then add the existing directly. If the business
    does not exist, then create a new contact.
  `,

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.contacts.ContactStatus'
  ],

  imports: [
    'auth',
    'ctrl',
    'user'
  ],

  exports: [
    'as wizard'
  ],
  
  css: `
    .business-list-container {
      position: relative;
    }
    .business-list {
      overflow-y: auto;
      height: 288px;
    }
    .search-count {
      color: #8e9090;
      font-size: 14px;
      font-style: italic;
      line-height: 1.43;
      text-align: center;
    }
    .create-new-block {
      position: absolute;
      top: 110;
      left: 110;
    }
    .center {
      display: flex;
      justify-content: center;
    }
    .search-result {
      color: #8e9090;
      font-size: 14px;
      font-style: italic;
      margin-bottom: 8px;
    }
    .align-text-center {
      text-align: center;
    }
    .foam-u2-layout-Cols {
      margin-top: 0 !important;
      justify-content: center !important;
    }
  `,

  messages: [
    { name: 'CONTACT_ADDED', message: 'Contact added successfully' }
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
    function init() {
      var permission = 'CA' === this.user.address.countryId ? 'currency.read.USD' : 'currency.read.CAD';
      var otherCountry = 'CA' === this.user.address.countryId ? 'US' : 'CA';
      this.auth.check(null, permission).then((hasPermission) => {
        if ( hasPermission ) this.data.permissionedCountries = [this.user.address.countryId, otherCountry];
      })
    },
    function initE() {
      var self = this;

      this.data.contact$.sub(function() {
        self.currentIndex = self.nextIndex;
      })

      this.addClass('wizard');
      this
        .start(this.Rows)
          .add(this.slot(function(sections, currentIndex) {
            return self.E().addClass('section-container')
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass('button-container')
              .tag(this.BACK, { buttonStyle: 'TERTIARY' })
              .start(this.SAVE).end()
            .end()
          .endContext()
        .end();
    },
    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;
      try {
        this.data.contact.signUpStatus = this.ContactStatus.CONNECTED;
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
    }
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