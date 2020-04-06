foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'BusinessListView',
  extends: 'foam.u2.View',

  documentation: 'A view that renders a query of businesses as a list.',

  imports: [
    'pushMenu',
    'wizard'
  ],

  methods: [
    function initE() {
      let { data }  = this.wizard;
      let self = this;

      this.start().addClass('business-list-container')
        .start().addClass('business-list')
          .select(data.unconnectedBusinesses$proxy, (business) => {
            return self.E()
              .start({
                class: 'net.nanopay.sme.ui.BusinessRowView',
                data: business
              })
                .on('click', function() {
                  let { data }  = self.wizard;
                  var contact = net.nanopay.contacts.Contact.create({
                    type: 'Contact',
                    group: 'sme',
                    organization: business.businessName,
                    businessId: business.id,
                    address: business.address
                  });
                  contact.businessSectorId = business.businessSectorId;
                  contact.operatingBusinessName = business.operatingBusinessName;
                  data.contact = contact;
                })
              .end();
          })
          .select(data.connectedBusinesses$proxy, (business) => {
            return this.E()
              .tag({
                class: 'net.nanopay.sme.ui.BusinessRowView',
                data: business
              });
          })
        .end()
        .start().show(this.slot(function(wizard$data$countBusinesses) {
          return wizard$data$countBusinesses !== 0;
        }))
          .addClass('search-count')
          .add(data.dot('searchBusinessesCount'))
        .end()
        .start().show(this.slot(function(wizard$data$filter) {
          return wizard$data$filter.length < 2;
        }))
          .addClass('create-new-block')
          .start()
            .addClass('center')
            .addClass('search-result')
            .add('Matching businesses will appear here')
          .end()
        .end()
        .start().show(this.slot(function(wizard$data$filter, wizard$data$countBusinesses) {
          return wizard$data$countBusinesses === 0 && wizard$data$filter.length > 1;
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
            .add(this.slot(function(wizard$data$filter) {
              return `Create a personal contact for “${wizard$data$filter}”?`;
            }))
          .end()
          .startContext({ data: this })
            .start()
              .addClass('center')
              .add(this.CREATE_NEW_CONTACT)
            .end()
          .endContext()
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'createNewContact',
      label: 'Create New',
      code: function() {
        this.pushMenu('sme.menu.create');
      }
    },
  ]
});