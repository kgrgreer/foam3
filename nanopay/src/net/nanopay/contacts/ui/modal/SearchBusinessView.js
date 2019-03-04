foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SearchBusinessView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The first step in the ContactWizardModal. Let the user enter an email
    address. Use the email address to see if an existing user exists or not.
    The next step in the wizard depends on the result.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.mlang.sink.Count',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business'
  ],

  imports: [
    'businessDAO',
    'ctrl',
    'notify',
    'publicUserDAO',
    'user',
    'validateEmail'
  ],

  css: `
    ^ {
      height: 593px;
      overflow-y: scroll;
    }
    ^ .property-email {
      width: 100%;
    }
    ^container {
      margin: 24px;
    }
    ^ .net-nanopay-ui-ActionView-cancel,
    ^ .net-nanopay-ui-ActionView-cancel:hover {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
    ^searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^filter-search {
      height: 40px;
      border-radius: 2px;
      border-color: #e2e2e3;
      background-color: #ffffff;
      vertical-align: top;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^create-new-block {
      margin-top: 120px;
    }
    ^center {
      display: flex;
      justify-content: center;
    }
    ^search-result {
      color: #8e9090;
      margin-bottom: 16px;
    }
    ^instruction {
      color: #8e9090;
      line-height: 1.43;
      margin-top: 8px;
      margin-bottom: 16px;
    }
    ^ .net-nanopay-contacts-ui-modal-SearchBusinessView-search-result span {
      width: 462px;
      overflow-wrap: break-word;
    }
    ^align-text-center {
      text-align: center;
    }
    ^search-count {
      color: #8e9090;
      font-size: 14px;
      font-style: italic;
      line-height: 1.43;
      text-align: center;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Add a Contact'
    },
    {
      name: 'BUSINESS_NAME',
      message: 'Business name'
    },
    {
      name: 'INSTRUCTION',
      message: `Search a business on Ablii to add them to your
        contacts.  For better results, search using their registered
        business name and location.`
    },
    {
      name: 'BUSINESS_PLACEHOLDER',
      message: `Matching businesses will appear here`
    },
    {
      name: 'GENERIC_FAILURE',
      message: `An unexpected problem occurred. Please try again later.`
    },
    {
      name: 'ADD_CONTACT_SUCCESS',
      message: 'Contact added'
    },
    {
      name: 'DEFAULT_TEXT',
      message: 'Matching businesses will appear here'
    },
    {
      name: 'NO_MATCH_TEXT',
      message: 'We couldn’t find a business with that name.'
    },
    {
      name: 'NO_MATCH_TEXT_2',
      message: 'Create a personal contact named'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Start typing to search',
        onKey: true
      }
    },
    {
      type: 'Int',
      name: 'count',
      documentation: `The number of items in the list after filtering.`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'searchBusiness',
      expression: function(filter) {
        if ( filter.length < 2 ) {
          return foam.dao.NullDAO.create({ of: net.nanopay.model.Business });
        } else {
          var dao = this.businessDAO
            .where(
              this.AND(
                this.NEQ(this.Business.ID, this.user.id),
                this.EQ(this.Business.STATUS, this.AccountStatus.ACTIVE),
                this.EQ(this.Business.COMPLIANCE, this.ComplianceStatus.PASSED),
                this.CONTAINS_IC(this.Business.ORGANIZATION, filter)
              )
            );
          dao
            .select(this.Count.create())
            .then((sink) => {
              this.count = sink != null ? sink.value : 0;
            });
          return dao;
        }
      }
    },
    {
      class: 'String',
      name: 'countBusiness',
      expression: function(filter) {
        if ( filter.length > 1 ) {
          if ( this.count > 1 ) {
            return `Showing ${this.count} of ${this.count} results`;
          } else {
            return `Showing ${this.count} of ${this.count} result`;
          }
        }
      }
    },
    {
      type: 'Boolean',
      name: 'showNoMatch',
      expression: function(filter, count) {
        return count === 0 && filter.length > 1;
      }
    },
    {
      type: 'Boolean',
      name: 'showDefault',
      expression: function(filter) {
        return filter.length < 2;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('container'))
          .start().addClass('contact-title')
            .add(this.TITLE)
          .end()
          .start().addClass(this.myClass('instruction'))
            .add(this.INSTRUCTION)
          .end()
          .start()
            .addClass('input-label')
            .add(this.BUSINESS_NAME)
          .end()
          .start().style({ 'position': 'relative' })
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
              .addClass(this.myClass('searchIcon'))
            .end()
            .start(this.FILTER)
              .addClass(this.myClass('filter-search'))
            .end()
          .end()
          .start()
            .addClass('divider')
          .end()
          .start().style({ 'overflow-y': 'scroll' })
            .select(this.searchBusiness$proxy, (business) => {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessRowView',
                  data: business
                })
                  .on('click', function() {
                    // Add contact
                    self.addSelected(business);
                  })
                .end();
            })
          .end()
          .start()
            .show(this.slot(function(count) {
              return count !== 0;
            }))
            .addClass(this.myClass('search-count'))
            .add(this.dot('countBusiness'))
          .end()
          .start().show(this.showDefault$)
            .addClass(this.myClass('create-new-block'))
            .start()
              .addClass(this.myClass('center'))
              .addClass(this.myClass('search-result'))
              .add(this.DEFAULT_TEXT)
            .end()
            .start()
              .addClass(this.myClass('center'))
              .start(this.CREATE_NEW).end()
            .end()
          .end()
          .start().show(this.showNoMatch$)
            .addClass(this.myClass('create-new-block'))
            .start()
              .addClass(this.myClass('center'))
              .addClass(this.myClass('search-result'))
              .add(this.NO_MATCH_TEXT)
            .end()
            .start()
              .addClass(this.myClass('center'))
              .addClass(this.myClass('search-result'))
              .addClass(this.myClass('align-text-center'))
              .add(this.slot(function(filter) {
                return `${this.NO_MATCH_TEXT_2} “${filter}”?`;
              }))
            .end()
            .start().addClass(this.myClass('center'))
              .start(this.CREATE_NEW_WITH_BUSINESS).end()
            .end()
          .end()
        .end();
    },

    async function addSelected(business) {
      newContact = this.Contact.create({
        organization: business.organization,
        businessName: business.organization,
        businessId: business.id,
        email: business.email,
        type: 'Contact',
        group: 'sme'
      });

      try {
        await this.user.contacts.put(newContact);
        this.ctrl.notify(this.ADD_CONTACT_SUCCESS);
        this.closeDialog();
      } catch (err) {
        this.ctrl.notify(err ? err.message : this.GENERIC_FAILURE, 'error');
      }
    }
  ],

  actions: [
    {
      name: 'createNew',
      label: 'Create New',
      code: function(X) {
        this.wizard.viewData.isEdit = false;
        X.viewData.isBankingProvided = false;
        X.pushToId('AddContactStepOne');
      }
    },
    {
      name: 'createNewWithBusiness',
      label: 'Create New',
      code: function(X) {
        this.wizard.data.organization = this.filter;
        this.wizard.viewData.isEdit = false;
        X.viewData.isBankingProvided = false;
        X.pushToId('AddContactStepOne');
      }
    },
  ]

});
