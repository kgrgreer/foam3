foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SearchEmailView',
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
    'net.nanopay.admin.model.AccountStatus',
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
      name: 'DESCRIPTION',
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
        if ( filter.length < 3 ) {
          return foam.dao.NullDAO.create({ of: net.nanopay.model.Business });
        } else {
          var dao = this.businessDAO
            .where(
              this.AND(
                this.NEQ(this.Business.ID, this.user.id),
                this.NEQ(this.Business.STATUS, this.AccountStatus.DISABLED),
                this.CONTAINS_IC(this.Business.ORGANIZATION, filter)
              )
            );
          dao
            .select(foam.mlang.sink.Count.create())
            .then((sink) => {
              this.count = sink != null ? sink.value : 0;
            });
          return dao;
        }
      }
    },
    {
      type: 'Boolean',
      name: 'showNoMatch',
      expression: function(filter, count) {
        return count === 0 && filter.length > 2;
      }
    },
    {
      type: 'Boolean',
      name: 'showDefault',
      expression: function(filter) {
        return filter.length < 3;
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
          .start('h2')
            .add(this.TITLE)
          .end()
          .start()
            .add(this.DESCRIPTION)
          .end()
          .start()
            .addClass('input-label')
            .add(this.BUSINESS_NAME)
          .end()
          .start()
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
              .addClass('searchIcon')
            .end()
            .start(this.FILTER).addClass('filter-search').end()
          .end()
          .start().style({ 'overflow-y': 'scroll' })
            .select(this.searchBusiness$proxy, (business) => {
              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessRowView2',
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
            .show(this.showDefault$)
            .start().add('Matching businesses will appear here').end()
            .start(this.CREATE).end()

          .end()
          .start()
            .show(this.showNoMatch$)
            .start().add(this.NO_MATCH_TEXT).end()
            .start().add(this.slot(function(filter) {
              return `${this.NO_MATCH_TEXT_2} “${filter}”?`;
            })).end()
            .start(this.CREATE).end()
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
      name: 'create',
      code: function(X) {
        this.wizard.viewData.isEdit = false;
        X.viewData.isBankingProvided = true;
        X.pushToId('information');
      }
    },
  ]

});
