foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'BusinessNameSearchWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',
  
  documentation: `
    Lets the user search public companies by their operating business names.
    If the business exists, then add the existing directly. If the business
    does not exist, then create a new contact.
  `,

  imports: [
    'auth',
    'ctrl',
    'user'
  ],

  exports: [
    'as wizard'
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
    .business-list-container {
      position: relative;
    }
    .business-list {
      overflow-y: scroll;
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

  messages: [
    { name: 'CONTACT_ADDED', message: 'Personal contact added.' }
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

      this.addClass(this.myClass());
      this
        .start(this.Rows)
          .add(this.slot(function(sections, currentIndex) {
            return self.E().addClass(self.myClass('section-container'))
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass(this.myClass('button-container'))
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