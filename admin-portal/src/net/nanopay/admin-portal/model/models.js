foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'Business',

  documentation: 'Business information.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'email',
      required: true
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'profileImageURL'
    },
    {
      class: 'String',
      name: 'defaultContact'
    },
    {
      class: 'String',
      name: 'secureAssetStore',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'Double',
      name: 'businessNumber'
    },
    {
      class: 'String',
      name: 'idVerificationUrl'
    },
    {
      class: 'String',
      name: 'businessVerificationUrl'
    },
    {
      class: 'String',
      name: 'website'
    },
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.admin.model.BusinessSector',
      name: 'sectorId'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.admin.model.BusinessType',
      name: 'businessTypeId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.BankAccountInfo',
      name: 'bankAccount',
      hidden: true,
      factory: function() { return net.nanopay.model.BankAccountInfo.create(); }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'businessContact',
    },
    {
      class: 'Boolean',
      name: 'xeroConnect'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'BusinessSector',

  documentation: 'Unknown, TODO.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'Document',

  documentation: 'Unknown, TODO.',

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'fileUrl',
      required: true
    },
    {
      class: 'String',
      name: 'note'
    },
    {
      class: 'Boolean',
      name: 'required'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'BusinessType',

  documentation: 'Proprietor details for business/businesses',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'Invoice',

  documentation: 'Invoice information.',

  ids: [ 'invoiceNumber' ],

  searchColumns: [
    'search', 'fromBusinessId', 'toBusinessId', 'status'
  ],

  tableColumns: [
    'invoiceNumber', 'purchaseOrder', 'fromBusinessName', 'toBusinessName', /*'fromBusinessId', 'toBusinessId',*/ 'issueDate', 'amount', 'status'
  ],

  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'net.nanopay.admin.model.Invoice', richSearch: true }
    },

    {
      class: 'Long',
      name: 'invoiceNumber',
      label: 'Invoice #',
      aliases: [ 'id', 'invoice', 'i' ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      label: 'PO #',
      aliases: [ 'purchase', 'po', 'p' ],
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Date Due',
      required: true,
      factory: function() { return new Date(); },
      aliases: [ 'dueDate', 'due', 'd', 'issued' ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      class: 'Date',
      name: 'paymentDate',
      label: 'Received',
      aliases: [ 'scheduled', 'paid' ],
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toISOString().substring(0,10));
        }
      }
    },
    {
      class: 'String',
      name: 'toBusinessName',
      label: 'Vendor',
      aliases: [ 'to', 'vendor', 'v' ],
      transient: true
    },
    {
      class: 'String',
      name: 'fromBusinessName',
      label: 'Customer',
      aliases: [ 'from', 'customer', 'c' ],
      transient: true
    },
    {
      name: 'paymentId'
    },
    {
      class: 'Boolean',
      name: 'draft',
      value: false
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceId'
    },
    {
      class: 'String',
      name: 'freshbooksInvoiceNumber'
    },
    {
      class: 'String',
      name: 'freshbooksInvoicePurchaseOrder'
    },
    {
      class: 'String',
      name: 'invoiceFileUrl'
    },
    {
      class: 'String',
      name: 'invoiceImageUrl'
    },
    {
      // TODO: make Currency class
      class: 'Double',
      name: 'amount',
      aliases: [ 'a' ],
      required: true,
      tableCellFormatter: function(a) {
        this.start().style({'text-align': 'right', 'padding-right': '20px'}).add('$' + a.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')).end();
      }
    },
    {
      class: 'Double',
      name: 'currencyCode',
      required: true
    },
    {
      name: 'iso20022',
      required: true
    },
    {
      name: 'status',
      transient: true,
      aliases: [ 's' ],
      expression: function(draft, paymentId, issueDate, paymentDate) {
        if ( draft ) return 'Draft';
        if ( paymentId === -1 ) return 'Disputed';
        if ( paymentId ) return 'Paid';
        if ( issueDate.getTime() < Date.now() ) return 'Overdue';
        if ( issueDate.getTime() < Date.now() + 24*3600*7*1000 ) return 'Due';
        return paymentDate ? 'Scheduled' : 'New';
      },
      searchView: { class: "foam.u2.search.GroupBySearchView", width: 40, viewSpec: { class: 'foam.u2.view.ChoiceView', size: 8 } },
      tableCellFormatter: function(state, obj, rel) {
        function formatDate(d) { return d ? d.toISOString().substring(0,10) : ''; }

        var label;

        if ( state === 'Scheduled' || state === 'Paid' ) {
          label = state + ' ' + formatDate(obj.paymentDate);
        } else {
          label = state;
        }

        this.start().addClass('Invoice-Status-' + state).add(label).end();
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'Payment',

  documentation: 'Payment information.',

  properties: [
    {
      class: 'String',
      name: 'vtmb64',
      required: true
    },
    {
      name: 'payerUserId',
      required: true
    },
    {
      name: 'payerBusinessId',
      required: true
    },
    {
      name: 'payeeBusinessId',
      required: true
    },
    {
      class: 'Date',
      name: 'paymentDate',
      required: true
    },
    {
      class: 'Date',
      name: 'scheduleDate'
    },
    {
      name: 'invoiceId',
      required: true
    },
    {
      class: 'Double',
      name: 'amount',
      required: true
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'PendingPayment',

  documentation: 'Pending payment information.',

  properties: [
    {
      name: 'payerBusinessId',
      required: true
    },
    {
      name: 'payeeBusinessId',
      required: true
    },
    {
      class: 'Date',
      name: 'scheduleDate',
      required: true
    },
    {
      class: 'Date',
      name: 'paymentDate'
    },
    {
      name: 'invoiceId',
      required: true
    },
    {
      name: 'payerUserId',
      required: true
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'Double',
      name: 'amount',
      required: true
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.admin.model.Business',
  targetModel: 'net.nanopay.admin.model.Invoice',
  forwardName: 'sales',
  inverseName: 'toBusinessId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
//    aliases: [ 'to', 'vendor' ],
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.businessDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (business) {
            resolve(business ? business.name : 'Unknown Business: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.name);
      }.bind(this));
    }
  }
});


foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.admin.model.Business',
  targetModel: 'net.nanopay.admin.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'fromBusinessId',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
//    aliases: [ 'from', 'customer' ],
    searchView: {
      class: "foam.u2.search.GroupBySearchView",
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.businessDAO;
        return new Promise(function (resolve, reject) {
          dao.find(key).then(function (business) {
            resolve(business ? business.name : 'Unknown Business: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function (o) {
        this.add(o.name);
      }.bind(this));
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.admin.model.Business',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'members',
  inverseName: 'business'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.admin.model.Business',
  targetModel: 'net.nanopay.admin.model.Business',
  forwardName: 'partners',
  inverseName: 'partnered',
  cardinality: '*:*'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.admin.model.Business',
  targetModel: 'foam.nanos.auth.Address',
  forwardName: 'addresses',
  inverseName: 'businessId',
  sourceProperty: {
    hidden: true
  }
});


foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'TopUp',

  documentation: 'Top Up information.',

  ids: [ 'topUpNumber' ],

  tableColumns: [
    'issueDate', 'amount', 'expectedDate'
  ],

  properties: [
    {
      class: 'Long',
      name: 'topUpNumber',
      label: 'Top Up Number',
      aliases: [ 'id', 't', 'i' ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Date & Time',
      required: true,
      factory: function() { return new Date(); },
      aliases: [ 'issued', 'date' ],
      tableCellFormatter: function(date) {
        this.start()
          .add(date.toString().slice(0, -15))
        .end();
      }
    },
    {
      class: 'Date',
      name: 'expectedDate',
      label: 'Expecting Receiving Date',
      aliases: [ 'receiveDate', 'paid' ],
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toString().slice(0, -24));
        }
      }
    },
    {
      // TODO: make Currency class
      class: 'Double',
      name: 'amount',
      aliases: [ 'a' ],
      required: true,
      tableCellFormatter: function(a) {
        this.start().add('$' + a.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')).style({color: '#2cab70'}).end();
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.nanos.auth.User',

  searchColumns: [
    'search', 'fullName', 'email', 'phone', 'type'
  ],
  
  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'foam.nanos.auth.User', richSearch: true }
    },
    {
      name: 'phone',
      aliases: [ 'p' ],
      tableCellFormatter: function(phone) {
        var p = phone.number;
        if ( p )
          this.start().add(p.slice(0, 3), '-', p.slice(3, 6), '-', p.slice(6)).end();
      }
    },
    {
      name: 'fullName',
      expression: function() { return this.firstName + ( this.lastName ? ' ' + this.lastName : '' ); },
      aliases: [ 'name' ],
      tableCellFormatter: function(obj) {
        return this.start()
                  .start({ class: 'foam.u2.tag.Image', data: './images/business-placeholder.png' }) // TODO: fetch from obj
                    .addClass('profile-photo')
                  .end()
                  .add(obj)
                .end()
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.admin.model',
  name: 'Transaction',

  documentation: 'Transaction information.',

  ids: [ 'transactionNumber' ],

  searchColumns: [
    'search', 'issueDate', 'payer', 'payee', 'amount', 'transactionNumber'
  ],

  tableColumns: [
    'issueDate', 'payer', 'payee', 'amount'
  ],

  properties: [
    {
      name: 'search',
      transient: true,
      searchView: { class: "foam.u2.search.TextSearchView", of: 'net.nanopay.admin.model.Transaction', richSearch: true }
    },

    {
      class: 'Long',
      name: 'transactionNumber',
      label: 'Transaction #',
      aliases: [ 'id', 'transaction', 'i', 't' ],
      visibility: foam.u2.Visibility.FINAL
    },
    // TODO: Change payer/payee to Reference of 'foam.nanos.auth.User'
    //   && Setup Relationship. Needs development of User service so not
    //   yet possible.
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'payer',
      label: 'Payer',
      tableCellFormatter: function(obj) {
        return this.start()
                  .start({ class: 'foam.u2.tag.Image', data: obj.profilePicture })
                    .addClass('profile-photo')
                  .end()
                  .add(obj.firstName + ( obj.lastName ? ' ' + obj.lastName : '' )).end();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'payee',
      label: 'Payee',
      tableCellFormatter: function(obj) {
        return this.start()
                  .start({ class: 'foam.u2.tag.Image', data: obj.profilePicture })
                    .addClass('profile-photo')
                  .end()
                  .add(obj.firstName + ( obj.lastName ? ' ' + obj.lastName : '' )).end();
      }
    },
    {
      class: 'Date',
      name: 'issueDate',
      label: 'Date & Time',
      required: true,
      factory: function() { return new Date(); },
      aliases: [ 'issueDate', 'date', 'd', 'issued' ],
      tableCellFormatter: function(date) {
        this.start()
          .add(date.toString().slice(0, -15))
        .end();
      }
    },
    {
      // TODO: make Currency class
      class: 'Double',
      name: 'amount',
      aliases: [ 'a' ],
      required: true,
      tableCellFormatter: function(a) {
        this.start().add('$' + a.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')).style({color: '#2cab70'}).end();
      }
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.model.BankAccountInfo',

  tableColumns: [ 'accountName', 'transitNumber', 'bankNumber', 'accountNumber', 'status', 'run' ],

  properties: [
    // TODO: Move to nanopaycommon
    {
      class: 'Long',
      name: 'id'
    },
    {
      name: 'status',
      tableCellFormatter: function(a) {
        var colour = ( a == 'verified' ) ? '#2cab70' : '#f33d3d';
        this.start()
          .add(a)
          .style({
            'color': colour,
            'text-transform': 'capitalize'
          })
        .end();
      }
    }
  ],

  actions: [
    {
      name: 'run',
      icon: 'images/ic-options-hover.svg',
      code: function() {
        foam.nanos.menu.SubMenuView.create({menu: foam.nanos.menu.Menu.create({id: 'accountSettings'})});
      }
    }
  ]
});
