foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'BusinessNameSearch',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.NullDAO',
    'foam.dao.PromisedDAO',
    'foam.mlang.sink.Count',
    'net.nanopay.auth.PublicBusinessInfo',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business'
  ],

  imports: [
    'publicBusinessDAO',
    'user',
    'pushMenu'
  ],

  sections: [
    {
      name: 'search',
      title: 'Search by Business Name',
      subTitle: `Search a business on Ablii to add them to your
      contacts.  For better results, search using their registered
      business name and location.`
    },
    {
      name: 'confirm',
      title: ''
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: 'This property is the data binding for the search field',
      section: 'search',
      label: 'Business Name',
      placeholder: 'Search business name',
      type: 'search',
      view: {
        class: 'foam.u2.view.IconTextFieldView',
        icon: 'images/ablii/payment-code.png',
        onKey: true
      }
    },
    {
      class: 'Int',
      name: 'connectedCount',
      documentation: `
        The number of connected businesses in the
        connctedBusiness dao after filtering.
      `,
      section: 'search',
      visibility: 'HIDDEN'
    },
    {
      class: 'Int',
      name: 'unconnectedCount',
      documentation: `
        The number of unconnected businesses in the
        unconnctedBusiness dao after filtering.
      `,
      section: 'search',
      visibility: 'HIDDEN'
    },
    {
      class: 'Int',
      name: 'countBusinesses',
      documentation: `
        Total number of businesses after filtering
        including the connected and unconnected businesses.
      `,
      section: 'search',
      visibility: 'HIDDEN',
      expression: function(connectedCount, unconnectedCount) {
        return connectedCount + unconnectedCount;
      }
    },
    {
      class: 'StringArray',
      name: 'permissionedCountries',
      documentation: 'Array of countries user has access to based on currency.read.permission',
      section: 'search',
      visibility: 'HIDDEN',
      factory: function(){
        return  [this.user.address.countryId];
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'unconnectedBusinesses',
      documentation: `
        This property is to query all unconnected businesses related to
        the current acting business.
      `,
      section: 'search',
      visibility: 'HIDDEN',
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
                      this.OR(
                        this.CONTAINS_IC(this.Business.ORGANIZATION, filter),
                        this.CONTAINS_IC(this.Business.OPERATING_BUSINESS_NAME, filter)
                      ),
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
      class: 'foam.dao.DAOProperty',
      name: 'connectedBusinesses',
      documentation: `
        This property is to query all connected businesses related to
        the current acting business.
      `,
      section: 'search',
      visibility: 'HIDDEN',
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
                      this.OR(
                        this.CONTAINS_IC(this.Business.ORGANIZATION, filter),
                        this.CONTAINS_IC(this.Business.OPERATING_BUSINESS_NAME, filter)
                      ),
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
      class: 'String',
      name: 'searchBusinessesCount',
      documentation: `Construct the searching count string.`,
      section: 'search',
      visibility: 'HIDDEN',
      expression: function(filter, countBusinesses) {
        if ( filter.length > 1 ) {
          if ( countBusinesses > 1 ) {
            return `Showing ${countBusinesses} of ${countBusinesses} results`;
          } else {
            return `Showing ${countBusinesses} of ${countBusinesses} result`;
          }
        }
        return '';
      }
    },
    {
      name: 'list',
      section: 'search',
      label: '',
      view: function(_, X) {
        return foam.u2.Element.create()
          .start().addClass('business-list-container')
            .start().addClass('business-list')
              .select(X.data.unconnectedBusinesses$proxy, (business) => {
                return foam.u2.Element.create({}, X)
                  .start({
                    class: 'net.nanopay.sme.ui.BusinessRowView',
                    data: business
                  })
                    .on('click', function() {
                      var contact = net.nanopay.contacts.Contact.create({
                        type: 'Contact',
                        group: 'sme',
                        organization: business.businessName,
                        businessId: business.id,
                        address: business.address
                      });
                      contact.businessSectorId = business.businessSectorId;
                      contact.operatingBusinessName = business.operatingBusinessName;
                      X.data.contact = contact;
                    })
                  .end();
              })
              .select(X.data.connectedBusinesses$proxy, (business) => {
                return foam.u2.Element.create({}, X)
                  .tag({
                    class: 'net.nanopay.sme.ui.BusinessRowView',
                    data: business
                  });
              })
            .end()
            .start() 
              .show(X.data.slot(function(countBusinesses) {
                return countBusinesses !== 0;
              }))
              .addClass('search-count')
              .add(X.data.dot('searchBusinessesCount'))
            .end()
            .start().show(X.data.slot(function(filter) {
              return filter.length < 2;
            }))
              .addClass('create-new-block')
              .start()
                .addClass('center')
                .addClass('search-result')
                .add('Matching businesses will appear here')
              .end()
            .end()
            .start().show(X.data.slot(function(filter, countBusinesses) {
              return countBusinesses === 0 && filter.length > 1;
            }))
              .addClass('create-new-block')
              .start()
                .addClass('center')
                .addClass('search-result')
                .add('We couldn’t find a business with that name.')
              .end()
              .start()
                .addClass('center')
                .addClass('search-result')
                .addClass('align-text-center')
                .add(X.data.slot(function(filter) {
                  return `Create a personal contact for “${filter}”?`;
                }))
              .end()
              .start()
                .addClass('center')
                .start(foam.core.Action.create({ label: 'Create New' }, X))
                  .style({
                    'background-color': '#604aff',
                    'border': '1px solid #4a33f4',
                    'font-family': `'Lato', sans-serif`
                  })
                  .on('click', function() {
                    X.data.pushMenu('sme.menu.create')
                  })
                .end()
              .end()
            .end()
          .end();
      }
    },
    {
      class: 'FObjectProperty',
      name: 'contact',
      section: 'confirm',
      label: '',
      view: { class: 'net.nanopay.contacts.ui.modal.AddContactConfirmation' }
    }
  ]
});