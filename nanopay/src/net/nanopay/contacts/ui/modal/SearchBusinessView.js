foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SearchBusinessView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The initial step in the ContactWizardModal. Let the user search company or
    organization by the business name. If the business exists, then add the
    existing directly. If the business does not exist, then invite the contact
    to join Ablii.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.NullDAO',
    'foam.dao.PromisedDAO',
    'foam.mlang.sink.Count',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicBusinessInfo',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business'
  ],

  imports: [
    'auth',
    'publicBusinessDAO',
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
    ^container {
      margin: 24px;
    }
    ^ .foam-u2-ActionView-cancel,
    ^ .foam-u2-ActionView-cancel:hover {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
    ^searchIcon {
      position: absolute;
      margin-left: 10px;
      margin-top: 14px;
    }
    ^ ^filter-search {
      vertical-align: top;
      box-shadow:none;
      padding-left: 31px;
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
      font-size: 14px;
      font-style: italic;
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
    ^search-field {
      position: relative;
    }
    ^business-list {
      overflow-y: scroll;
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'SEARCH_ICON',
      value: 'images/ablii/searchicon-resting.svg'
    }
  ],

  messages: [
    {
      name: 'TITLE',
      message: 'Add a contact'
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
      name: 'GENERIC_FAILURE',
      message: `An unexpected problem occurred. Please try again later.`
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
    },
    {
      name: 'ADD_CONTACT_SUCCESS',
      message: 'Personal contact added.'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: 'This property is the data binding for the search field',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Start typing to search',
        onKey: true,
        focused: true
      }
    },
    {
      type: 'Int',
      name: 'connectedCount',
      documentation: `
        The number of connected businesses in the 
        connctedBusiness dao after filtering.
      `
    },
    {
      type: 'Int',
      name: 'unconnectedCount',
      documentation: `
        The number of unconnected businesses in the 
        unconnctedBusiness dao after filtering.
      `
    },
    { type: 'Int',
      name: 'countBusinesses',
      documentation: `
        Total number of businesses after filtering
        including the connected and unconnected businesses.
      `,
      expression: function(connectedCount, unconnectedCount) {
        return connectedCount + unconnectedCount;
      }
    },
    {
      class: 'StringArray',
      name: 'permissionedCountries',
      documentation: 'Array of countries user has access to based on currency.read.permission',
      factory: function(){
        return  [this.user.address.countryId];
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'connectedBusinesses',
      documentation: `
        This property is to query all connected businesses related to 
        the current acting business.
      `,
      expression: function(filter) {
        if ( filter.length < 2 ) {
          return this.NullDAO.create({ of: this.PublicBusinessInfo });
        } else {
          return this.PromisedDAO.create({
            promise: this.user.contacts
              .select(this.MAP(this.Contact.BUSINESS_ID))
              .then((mapSink) => {
                var dao = this.publicBusinessDAO
                  .where(
                    this.AND(
                      this.NEQ(this.Business.ID, this.user.id),
                      this.CONTAINS_IC(this.Business.ORGANIZATION, filter),
                      this.IN(this.Business.ID, mapSink.delegate.array)
                    )
                  );
                dao
                  .select(this.Count.create())
                  .then((sink) => {
                    this.connectedCount = sink != null ? sink.value : 0;
                  });
                return dao;
              })
          });
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'unconnectedBusinesses',
      documentation: `
        This property is to query all unconnected businesses related to 
        the current acting business.
      `,
      expression: function(filter) {
        if ( filter.length < 2 ) {
          return this.NullDAO.create({ of: net.nanopay.auth.PublicBusinessInfo });
        } else {
          return this.PromisedDAO.create({
            promise: this.user.contacts
              .select(this.MAP(this.Contact.BUSINESS_ID))
              .then((mapSink) => {
                var dao = this.publicBusinessDAO
                  .where(
                    this.AND(
                      this.NEQ(this.Business.ID, this.user.id),
                      this.CONTAINS_IC(this.Business.ORGANIZATION, filter),
                      this.NOT(this.IN(this.Business.ID, mapSink.delegate.array)),
                      this.IN(this.DOT(net.nanopay.model.Business.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), this.permissionedCountries)
                    )
                  );
                dao
                  .select(this.Count.create())
                  .then((sink) => {
                    this.unconnectedCount = sink != null ? sink.value : 0;
                  });
                return dao;
              })
          });
        }
      }
    },
    {
      type: 'String',
      name: 'searchBusinessesCount',
      documentation: `Construct the searching count string.`,
      expression: function(filter, countBusinesses) {
        if ( filter.length > 1 ) {
          if ( this.countBusinesses > 1 ) {
            return `Showing ${countBusinesses} of ${countBusinesses} results`;
          } else {
            return `Showing ${countBusinesses} of ${countBusinesses} result`;
          }
        }
        return '';
      }
    },
    {
      type: 'Boolean',
      name: 'showNoMatch',
      documentation: `
        Only show no matching text 'We couldn’t find a business with that name'
        when the searching keyword is longer than 1 char.
      `,
      expression: function(filter, countBusinesses) {
        return countBusinesses === 0 && filter.length > 1;
      }
    },
    {
      type: 'Boolean',
      name: 'showDefault',
      documentation: `
        Only show the default searching text when the searching keyword 
        is shorter than 2 chars.
      `,
      expression: function(filter) {
        return filter.length < 2;
      }
    }
  ],

  methods: [
    function init() {
      this.permissionedCountries = [this.user.address.countryId];
      var permission = 'CA' === this.user.address.countryId ? 'currency.read.USD' : 'currency.read.CAD';
      var otherCountry = 'CA' === this.user.address.countryId ? 'US' : 'CA';
      this.auth.check(null, permission).then((hasPermission) => {
        if ( hasPermission ) this.permissionedCountries = [this.user.address.countryId, otherCountry];
      })
    },
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
            .addClass('field-label')
            .add(this.BUSINESS_NAME)
          .end()
          .start().addClass(this.myClass('search-field'))
            .start({
              class: 'foam.u2.tag.Image',
              data: this.SEARCH_ICON
            })
              .addClass(this.myClass('searchIcon'))
            .end()
            .start(this.FILTER)
              .addClass(this.myClass('filter-search'))
            .end()
          .end()
          .start()
            .addClass('divider')
          .end()
          .start().addClass(this.myClass('business-list'))
            .select(this.unconnectedBusinesses$proxy, (business) => {
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
            .select(this.connectedBusinesses$proxy, (business) => {
              return this.E()
                .tag({
                  class: 'net.nanopay.sme.ui.BusinessRowView',
                  data: business
                });
            })
          .end()
          .start()
            .show(this.slot(function(countBusinesses) {
              return countBusinesses !== 0;
            }))
            .addClass(this.myClass('search-count'))
            .add(this.dot('searchBusinessesCount'))
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
