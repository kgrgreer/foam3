foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'BusinessNameSearchWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',
  
  documentation: `
    Lets the user search public companies by their operating business names.
    If the business exists, then add the existing directly. If the business
    does not exist, then create a new contact.
  `,
  
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

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            debugger;
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
      name: 'next',
      label: 'Next',
      isAvailable: function(nextIndex) {
        return nextIndex !== -1;
      },
      code: function() { 
        this.currentIndex = this.nextIndex;
      }
    },
    {
      name: 'save',
      label: 'Add Contact',
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: function(X) { 
        debugger;
        // X.pushMenu('sme.main.contacts');
      }
    }
  ]
});