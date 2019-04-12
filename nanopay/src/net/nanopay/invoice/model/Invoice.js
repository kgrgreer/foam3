foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'Invoice',

  documentation: `
    Model used by users to present and monitor transactional documents between
    one another and ensure the terms of their trading agreements are being met.
  `,

  requires: [
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  searchColumns: [
    'search', 'payerId', 'payeeId', 'status'
  ],

  tableColumns: [
    'id', 'invoiceNumber', 'purchaseOrder', 'payerId',
    'payeeId', 'issueDate', 'dueDate', 'amount', 'status'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.util.SafetyUtil',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.model.Currency',
    'net.nanopay.contacts.Contact'
  ],

  imports: [
    'currencyDAO'
  ],

  properties: [
    {
      name: 'search',
      documentation: `View and value used to filter invoices.`,
      transient: true,
      searchView: {
        class: 'foam.u2.search.TextSearchView',
        of: 'net.nanopay.invoice.model.Invoice',
        richSearch: true
      }
    },
    {
      class: 'Long',
      name: 'id',
      tableWidth: 60
    },
    {
      class: 'String',
      name: 'invoiceNumber',
      documentation: `A number used by the user to identify the invoice.`,
      label: 'Invoice #',
      aliases: [
        'invoice',
        'i'
      ],
      visibility: foam.u2.Visibility.FINAL,
      tableWidth: 110
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      documentation: `
        A number used by the user to identify the purchase order associated
        with the invoice.
      `,
      label: 'PO #',
      aliases: [
        'purchase',
        'po',
        'p'
      ]
    },
    {
      class: 'DateTime',
      name: 'issueDate',
      documentation: `The date that the invoice was issued (created).`,
      label: 'Issue Date',
      required: true,
      factory: function() {
        if ( this.draft ) {
          return null;
        }
        return new Date();
      },
      javaFactory: `
        if ( draft_ ){
          return null;
        }
        return new Date();
      `,
      javaSetter: `
        if ( this.__frozen__ ) throw new UnsupportedOperationException("Object is frozen.");
        issueDate_ = val;
        if ( issueDate_ != null ) {
          issueDateIsSet_ = true;
        }
      `,
      aliases: [
        'issueDate',
        'issue',
        'issued'
      ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'Date',
      name: 'dueDate',
      documentation: `The date that the invoice must be paid by.`,
      label: 'Date Due',
      aliases: ['dueDate', 'due', 'd', 'issued'],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      },
      tableWidth: 95
    },
    {
      class: 'DateTime',
      name: 'paymentDate',
      documentation: `The date that the invoice was paid.`,
      label: 'Received',
      aliases: ['scheduled', 'paid'],
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toISOString().substring(0, 10));
        }
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the invoice was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the invoice.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date the invoice was last modified.`,
      tableWidth: 140
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The id of the user who last modified the invoice.`,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payee',
      documentation: `The party receiving the payment.`,
      storageTransient: true,
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      documentation: `The party making the payment.`,
      storageTransient: true,
      hidden: true
    },
    {
      class: 'String',
      name: 'paymentId',
      documentation: `Transaction Id used to pay invoice.`,
    },
    {
      class: 'Boolean',
      name: 'draft',
      documentation: `Used to track whether an invoice is finalized or not.`,
      value: false
    },
    {
      class: 'String',
      name: 'invoiceFileUrl'
    },
    {
      class: 'String',
      name: 'note',
      documentation: `A written note that the user may add to the invoice.`,
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'Currency',
      name: 'amount',
      documentation: `
        The amount of money the invoice is for. The amount of money that will be
        deposited into the destination account. If fees or exchange applies the
        source amount may have to be adjusted.
      `,
      aliases: [
        'a',
        'targetAmount',
        'destinationAmount'
      ],
      required: true,
      tableCellFormatter: function(value, invoice) {
        // Needed to show amount value for old invoices that don't have destination currency set
        if ( ! invoice.destinationCurrency ) {
          invoice.destinationCurrency = 'CAD';
        }
        this.__subContext__.currencyDAO.find(invoice.destinationCurrency)
            .then(function(currency) {
              this.start()
                .add(invoice.destinationCurrency + ' ' + currency.format(value))
              .end();
        }.bind(this));
      },
      tableWidth: 120
    },
    { // How is this used? - display only?
      documentation: `
        Amount of funds to be withdrawn to pay for the invoice. This amount may
        be higher than the 'amount' (destination amount) if fees and/or exchange
        is involved.
      `,
      class: 'Currency',
      name: 'sourceAmount',
      documentation: `
        The amount used to pay the invoice, prior to exchange rates & fees.
      `,
      tableCellFormatter: function(value, invoice) {
        this.__subContext__.currencyDAO.find(invoice.sourceCurrency)
          .then(function(currency) {
            this.start()
              .add(invoice.sourceCurrency + ' ' + currency.format(value))
            .end();
        }.bind(this));
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      documentation: `Account funds with be deposited into.`
    },
    {
      class: 'Currency',
      name: 'exchangeRate',
      documentation: 'Exchange rate captured on time of payment.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.PaymentStatus',
      name: 'paymentMethod',
      documentation: `The state of payment of the invoice.`
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      value: 'CAD',
      documentation: `
        Currency of the account the funds with be deposited into.
      `
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      value: 'CAD',
      documentation: `Currency of the account the funds with be withdran from.`,
    },
    {
      name: 'iso20022',
    },
    {
      class: 'Boolean',
      name: 'external',
      documentation: 'Signifies invoice was created for an external user.'
    },
    {
      class: 'Boolean',
      name: 'autoPay',
      documentation: 'TODO'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      aliases: [
        'sourceAccount'
      ],
      documentation: `
        Invoiced account. The account funds will be withdrawn from.
      `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.InvoiceStatus',
      name: 'status',
      documentation: `
        The state of the invoice regarding payment. This is a calculated
        property used to determine whether an invoice is unpaid, void, pending,
        paid, scheduled, or overdue.
      `,
      transient: true,
      aliases: [
        's'
      ],
      expression: function(draft, paymentId, dueDate, paymentDate, paymentMethod) {
        if ( draft ) return this.InvoiceStatus.DRAFT;
        if ( paymentMethod === this.PaymentStatus.VOID ) return this.InvoiceStatus.VOID;
        if ( paymentMethod === this.PaymentStatus.PENDING ) return this.InvoiceStatus.PENDING;
        if ( paymentMethod === this.PaymentStatus.CHEQUE ) return this.InvoiceStatus.PAID;
        if ( paymentMethod === this.PaymentStatus.NANOPAY ) return this.InvoiceStatus.PAID;
        if ( paymentMethod === this.PaymentStatus.TRANSIT_PAYMENT ) return this.InvoiceStatus.PENDING;
        if ( paymentMethod === this.PaymentStatus.DEPOSIT_PAYMENT ) return this.InvoiceStatus.PENDING_ACCEPTANCE;
        if ( paymentMethod === this.PaymentStatus.DEPOSIT_MONEY ) return this.InvoiceStatus.DEPOSITING_MONEY;
        if ( paymentMethod === this.PaymentStatus.PENDING_APPROVAL ) return this.InvoiceStatus.PENDING_APPROVAL;
        if ( paymentDate > Date.now() && paymentId == 0 ) return (this.InvoiceStatus.SCHEDULED);
        if ( dueDate ) {
          if ( dueDate.getTime() < Date.now() ) return this.InvoiceStatus.OVERDUE;
          if ( dueDate.getTime() < Date.now() + 24*3600*7*1000 ) return this.InvoiceStatus.UNPAID;
        }
        return this.InvoiceStatus.UNPAID;
      },
      javaGetter: `
        if ( getDraft() ) return InvoiceStatus.DRAFT;
        if ( getPaymentMethod() == PaymentStatus.VOID ) return InvoiceStatus.VOID;
        if ( getPaymentMethod() == PaymentStatus.PENDING ) return InvoiceStatus.PENDING;
        if ( getPaymentMethod() == PaymentStatus.CHEQUE ) return InvoiceStatus.PAID;
        if ( getPaymentMethod() == PaymentStatus.NANOPAY ) return InvoiceStatus.PAID;
        if ( getPaymentMethod() == PaymentStatus.TRANSIT_PAYMENT ) return InvoiceStatus.PENDING;
        if ( getPaymentMethod() == PaymentStatus.DEPOSIT_PAYMENT ) return InvoiceStatus.PENDING_ACCEPTANCE;
        if ( getPaymentMethod() == PaymentStatus.DEPOSIT_MONEY ) return InvoiceStatus.DEPOSITING_MONEY;
        if ( getPaymentMethod() == PaymentStatus.PENDING_APPROVAL ) return InvoiceStatus.PENDING_APPROVAL;
        if ( getPaymentDate() != null ){
          if ( getPaymentDate().after(new Date()) && SafetyUtil.isEmpty(getPaymentId()) ) return InvoiceStatus.SCHEDULED;
        }
        if ( getDueDate() != null ){
          if ( getDueDate().getTime() < System.currentTimeMillis() ) return InvoiceStatus.OVERDUE;
          if ( getDueDate().getTime() < System.currentTimeMillis() + 24*3600*7*1000 ) return InvoiceStatus.UNPAID;
        }
        return InvoiceStatus.UNPAID;
      `,
      searchView: {
        class: 'foam.u2.search.GroupBySearchView',
        width: 40,
        viewSpec: {
          class: 'foam.u2.view.ChoiceView',
          size: 8
        }
      },
      tableCellFormatter: function(state, obj, rel) {
        var label;
        label = state.label;
        if ( state === net.nanopay.invoice.model.InvoiceStatus.SCHEDULED ) {
          label = label + ' ' + obj.paymentDate.toISOString().substring(0, 10);
        }

        this.start()
          .addClass('invoice-status-container')
          .start().addClass('generic-status-circle').addClass(label.replace(/\W+/g, '-')).end()
          .start().addClass('Invoice-Status').addClass(label.replace(/\W+/g, '-'))
            .add(label)
          .end()
        .end();
      },
      tableWidth: 130
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'invoiceFile',
      documentation: 'Original invoice file',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' }
    },
    {
      class: 'Boolean',
      name: 'scheduledEmailSent',
      documentation: `
        Used to track whether an email has been sent to the payer informing them
        that the payment they scheduled is near.
      `,
      value: false
    },
    {
      class: 'String',
      name: 'referenceId',
      javaFactory: `
        return UUID.randomUUID().toString();
      `
    },
    {
      class: 'Boolean',
      name: 'removed'
    },
    {
      class: 'Reference',
      targetDAOKey: 'contactDAO',
      of: 'net.nanopay.contacts.Contact',
      name: 'contactId',
      view: function(_, X) {
        var m = foam.mlang.ExpressionsSingleton.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              heading: 'Contacts',
              dao: foam.dao.PromisedDAO.create({
                promise: X.businessDAO
                  .where(m.NEQ(net.nanopay.model.Business.STATUS, net.nanopay.admin.model.AccountStatus.DISABLED))
                  .select(m.MAP(net.nanopay.model.Business.ID))
                  .then(function(sink) {
                    return X.user.contacts
                      .where(
                        m.OR(
                          m.IN(net.nanopay.contacts.Contact.BUSINESS_ID, sink.delegate.array),
                          m.EQ(net.nanopay.contacts.Contact.BUSINESS_ID, 0)
                        )
                      )
                      .orderBy(foam.nanos.auth.User.BUSINESS_NAME);
                  })
              })
            },
            {
              heading: 'Disabled contacts',
              dao: foam.dao.PromisedDAO.create({
                promise: X.businessDAO
                  .where(m.EQ(net.nanopay.model.Business.STATUS, net.nanopay.admin.model.AccountStatus.DISABLED))
                  .select(m.MAP(net.nanopay.model.Business.ID))
                  .then(function(sink) {
                    return X.user.contacts
                      .where(m.IN(net.nanopay.contacts.Contact.BUSINESS_ID, sink.delegate.array))
                      .orderBy(foam.nanos.auth.User.BUSINESS_NAME);
                  })
              }),
              disabled: true,
              hideIfEmpty: true
            }
          ]
        };
      }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'AFXConfirmationPDF',
      documentation: `
        If this invoice is associated with an AFX transaction, we generate an
        order confirmation PDF for the payer. The property exists to hold that
        PDF in such a scenario.
      `
    }
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        DAO bareUserDAO = (DAO) x.get("bareUserDAO");
        DAO currencyDAO = (DAO) x.get("currencyDAO");

        if ( SafetyUtil.isEmpty(this.getDestinationCurrency()) ) {
          throw new IllegalStateException("Destination currency of the invoice cannot be empty.");
        } else {
          Currency currency = (Currency) currencyDAO.find(this.getDestinationCurrency());
          if ( currency == null ) {
            throw new IllegalStateException("Destination currency is not valid.");
          }
        }

        if ( this.getAmount() <= 0 ) {
          throw new IllegalStateException("Amount must be a number and greater than zero.");
        }

        boolean isInvoiceToContact = this.getContactId() != 0;
        boolean isPayeeIdGiven = this.getPayeeId() != 0;
        boolean isPayerIdGiven = this.getPayerId() != 0;

        if( ! isInvoiceToContact && ! isPayeeIdGiven && ! isPayerIdGiven ) {
            throw new IllegalStateException("ContactId/PayeeId/PayerId not provided.");
        }

        Contact contact = null;
        if ( isInvoiceToContact ) {
          contact = (Contact) bareUserDAO.find(this.getContactId());
          if ( contact == null ) {
            throw new IllegalStateException("No contact with the provided contactId exists.");
          }
          if ( ! isPayeeIdGiven && ! isPayerIdGiven ) {
            throw new IllegalStateException("PayeeId or PayerId not provided with the contact.");
          }
        }

        if ( ! isPayeeIdGiven && ! isInvoiceToContact ) {
          throw new IllegalStateException("Payee id must be an integer greater than zero.");
        } else {
          User payee = (User) bareUserDAO.find(
            isPayeeIdGiven ? this.getPayeeId() : contact.getBusinessId() != 0 ? contact.getBusinessId() : contact.getId());
          if ( payee == null && contact.getBusinessId() != 0 ) {
            throw new IllegalStateException("No user, contact, or business with the provided payeeId exists.");
          }
          // TODO: Move user checking to user validation service
          if ( payee != null && AccountStatus.DISABLED == payee.getStatus() ) {
            throw new IllegalStateException("Payee user is disabled.");
          }
        }

        if ( ! isPayerIdGiven && ! isInvoiceToContact  ) {
          throw new IllegalStateException("Payer id must be an integer greater than zero.");
        } else {
          User payer = (User) bareUserDAO.find(
            isPayerIdGiven ? this.getPayerId() : contact.getBusinessId() != 0 ? contact.getBusinessId() : contact.getId());
          if ( payer == null && contact.getBusinessId() != 0 ) {
            throw new IllegalStateException("No user, contact, or business with the provided payerId exists.");
          }
          // TODO: Move user checking to user validation service
          if ( payer != null && AccountStatus.DISABLED == payer.getStatus() ) {
            throw new IllegalStateException("Payer user is disabled.");
          }
        }
      `
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function(status) {
        return false;
        return status !== this.InvoiceStatus.PAID && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
      },
      code: function(X) {
        X.stack.push({
          class: 'net.nanopay.interac.ui.etransfer.TransferWizard',
          invoice: this
        });
      }
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'sales',
  inverseName: 'payeeId',
  targetDAOKey: 'invoiceDAO',
  sourceDAOKey: 'bareUserDAO',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
    documentation: `The receiver of the amount stated in the invoice.`,
    required: true,
    view: function(_, X) {
      return {
        class: 'foam.u2.view.RichChoiceView',
        selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
        rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
        sections: [
          {
            heading: 'Users',
            dao: X.userDAO
          }
        ]
      };
    },
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function(resolve, reject) {
          dao.find(key).then(function(user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.add(obj.payee ? obj.payee.label() : 'N/A');
    }
  },
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'payerId',
  targetDAOKey: 'invoiceDAO',
  sourceDAOKey: 'bareUserDAO',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
    documentation: '(REQUIRED) Payer of the amount stated in the invoice.',
    required: true,
    view: function(_, X) {
      return {
        class: 'foam.u2.view.RichChoiceView',
        selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
        rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
        sections: [
          {
            heading: 'Users',
            dao: X.userDAO
          }
        ]
      };
    },
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise( function(resolve, reject) {
          dao.find(key).then( function(user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.add(obj.payer ? obj.payer.label() : 'N/A');
    }
  },
});
