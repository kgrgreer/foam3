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
  package: 'net.nanopay.invoice.model',
  name: 'Invoice',

  documentation: `The base model for presenting and monitoring transactional
    documents between Users, and to Users, and ensuring the terms of their
    trading agreements are met.
  `,

  requires: [
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.crunch.lite.Capable',
  ],

  searchColumns: [
    'invoiceNumber',
    'payerId',
    'payeeId',
    'issueDate',
    'payeeReconciled',
    'payerReconciled',
    'amount',
    'status'
  ],

  tableColumns: [
    'id',
    'invoiceNumber',
    'payer',
    'payee',
    'issueDate',
    'amount',
    'status'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.ServiceProviderAwareSupport',
    'foam.util.SafetyUtil',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.admin.model.AccountStatus',
    'foam.core.Currency',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.InvoiceLineItem'
  ],

  imports: [
    'accountDAO',
    'currencyDAO',
    'user'
  ],

  sections: [
    {
      name: 'invoiceInformation',
      title: 'Invoice Information',
      order: 1
    },
    {
      name: 'accountingInformation',
      title: 'Accounting',
      order: 2
    },
    {
      name: 'capabilityInformation',
      title: 'Capabilities',
      order: 3
    },
    {
      name: 'transactionInformation',
      title: 'Transaction',
      order: 4
    },
    {
      name: 'systemInformation',
      title: 'System Information',
      order: 5
    }
  ],

  properties: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Property)
      .map(p => p.clone())),
    {
      // TODO: remove
      name: 'search',
      section: 'systemInformation',
      documentation: `The view and value used to filter invoices.`,
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
      section: 'invoiceInformation',
      documentation: 'The ID for the Invoice.',
      tableWidth: 60,
      sheetsOutput: true
    },
    {
      class: 'String',
      name: 'invoiceNumber',
      section: 'invoiceInformation',
      visibilityPermissionRequired: true,
      documentation: `The identifying number stated on the invoice.`,
      label: 'Invoice #',
      aliases: [
        'invoice',
        'i'
      ],
      includeInDigest: true,
      updateVisibility: 'RO',
      tableWidth: 110
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `The identifying number from the purchase order as stated
        on the invoice.
      `,
      label: 'PO #',
      aliases: [
        'purchase',
        'po',
        'p'
      ]
    },
    {
      class: 'Date',
      name: 'issueDate',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The date that the invoice was issued (created).`,
      label: 'Date Issued',
      required: true,
      view: { class: 'foam.u2.DateView' },
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
        if ( isFrozen() ) throw new UnsupportedOperationException("Object is frozen.");
        issueDate_ = val;
        if ( issueDate_ != null ) {
          issueDateIsSet_ = true;
        }
      `,
      tableCellFormatter: function(val) {
        this.add(val.toLocaleDateString(foam.locale));
      },
      aliases: [
        'issueDate',
        'issue',
        'issued'
      ]
    },
    // TODO/REVIEW: all of the following dates could just be
    // InvoiceEvents, or could have a Date Array - name, date
    // Or See Transaction StatusHistory
    {
      class: 'Date',
      name: 'dueDate',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The date by which the invoice must be paid.`,
      label: 'Date Due',
      tableCellFormatter: function(val) {
        this.add(val.toLocaleDateString(foam.locale));
      },
      aliases: ['dueDate', 'due', 'd', 'issued'],
      tableWidth: 95
    },
    {
      class: 'DateTime',
      name: 'paymentDate',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The date and time of when the invoice payment was fully completed.`,
      label: 'Received',
      aliases: ['scheduled', 'paid']
    },
    {
      class: 'Date',
      name: 'processingDate',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The date by which the invoice payment begun.`,
      tableCellFormatter: function(val) {
        this.add(val ? val.toLocaleDateString(foam.locale) : null);
      }
    },
    {
      class: 'Date',
      name: 'approvalDate',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The date by which the invoice approval occured.`,
      tableCellFormatter: function(val) {
        this.add(val ? val.toLocaleDateString(foam.locale) : null);
      }
    },
    {
      class: 'Date',
      name: 'paymentSentDate',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `The date by which the invoice payment was sent.`,
      tableCellFormatter: function(val) {
        this.add(vale ? val.toLocaleDateString(foam.locale) : null);
      }
    },
    {
      class: 'Date',
      name: 'paymentReceivedDate',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `The date by which the invoice payment was received.`,
      tableCellFormatter: function(val) {
        this.add(val ? val.toLocaleDateString(foam.locale) : null);
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `The date and time of when the invoice was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The ID of the User who created the Invoice.`,
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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The ID of the Agent who created the Invoice.`,
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
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `The date and time that the Invoice was last modified.`,
      tableWidth: 140
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The ID of the individual person, or real user,
        who last modified the Invoice.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: 'Last time a XeroInvoice or QuickbooksInvoice was updated.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payee',
      label: 'Beneficiary',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `Returns the name of the party receiving the payment from the
        Public User Info model.`,
      tableCellFormatter: function(value, obj, rel) {
        this.add(value && value.toSummary ? value.toSummary() : 'N/A');
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      label: 'Customer',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `Returns the name of the party making the payment from the
        Public User Info model.`,
      tableCellFormatter: function(value, obj, rel) {
        this.add(value && value.toSummary ? value.toSummary() : 'N/A');
      },
    },
    {
      class: 'String',
      name: 'paymentId',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The transaction ID used to pay the invoice.`,
    },
    {
      class: 'Boolean',
      name: 'draft',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `Determines whether the Invoice is finalized.`,
      value: false,
      includeInDigest: false
    },
    // {
    //   class: 'String',
    //   name: 'invoiceFileUrl',
    //   section: 'invoiceInformation',
    //   documentation: 'A URL link to the online location of the invoice.',
    //   // invoiceFileUrl is not used. All references are commented out.
    //   includeInDigest: false
    // },
    {
      class: 'String',
      name: 'note',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `A written note that the user may add to the invoice.`,
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'UnitValue',
      name: 'chequeAmount',
      includeInDigest: true,
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `The amount paid for an invoice using an external transaction system.`
    },
    {
      class: 'String',
      name: 'chequeCurrency',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The currency of a transaction using by external transaction system.`,
      value: 'CAD'
    },
    {
      class: 'UnitValue',
      name: 'amount',
      includeInDigest: true,
      section: 'invoiceInformation',
      unitPropName: 'destinationCurrency',
      documentation: `
        The amount transferred or paid as per the invoice. The amount of money that will be
        deposited into the destination account. If fees or exchange apply, the source amount
        may have to be adjusted.
      `,
      aliases: [
        'a',
        'targetAmount',
        'destinationAmount'
      ],
      required: true,
      tableWidth: 120,
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        String dstCurrency = ((Invoice)obj).getDestinationCurrency();
        Currency currency = (Currency) currencyDAO.find(dstCurrency);

        // Outputting two columns: "amount", "destination Currency"
        outputter.outputValue(currency.format(get_(obj)));
        outputter.outputValue(dstCurrency);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "destination Currency"
        outputter.outputValue(getName());
        outputter.outputValue("Destination Currency");
      `
    },
    { // REVIEW: How is this used? - display only?,
      class: 'UnitValue',
      name: 'sourceAmount',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      unitPropName: 'sourceCurrency',
      documentation: `The amount paid to the invoice, prior to exchange rates & fees.
      `,
      includeInDigest: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `The bank account into which funds are to be deposited.`
    },
    {
      class: 'UnitValue',
      name: 'exchangeRate',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: 'The exchange rate captured at the time of payment.'
    },
    {
      // TODO Ensure client can't change this manually
      class: 'Enum',
      of: 'net.nanopay.invoice.model.PaymentStatus',
      name: 'paymentMethod',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `Tracks the payment instrument or method used to pay the invoice.`,
      value: net.nanopay.invoice.model.PaymentStatus.NONE
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      includeInDigest: true,
      section: 'invoiceInformation',
      value: 'CAD',
      documentation: `The currency of the bank account into which funds are to
        be deposited.
      `
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      value: 'CAD',
      documentation: `The currency of the bank account from which funds are to be
        withdrawn.`,
    },
    {
      name: 'iso20022',
      section: 'invoiceInformation',
      visibilityPermissionRequired: true,
      includeInDigest: false
    },
    {
      class: 'Boolean',
      name: 'external',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: 'Determines whether the invoice was created for an external user.',
      includeInDigest: false
    },
    {
      // TODO
      class: 'Boolean',
      name: 'autoPay',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: 'Determines whether the invoice can be paid automatically.',
      includeInDigest: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approvedBy',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: 'the ID of the user that approved this invoice within the business.',
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
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'invoiceInformation',
      aliases: [
        'sourceAccount'
      ],
      documentation: `As the invoiced account, this is the bank account from which
        funds will be withdrawn to pay an invoice.
      `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.InvoiceStatus',
      name: 'status',
      includeInDigest: true,
      section: 'invoiceInformation',
      documentation: `A list of the types of status for an invoice regarding payment. This
        is a calculated property used to determine whether an invoice is unpaid,
        void, pending, paid, scheduled, or overdue.
      `,
      aliases: [
        's'
      ],
      expression: function(draft, paymentId, dueDate, paymentDate, paymentMethod) {
        if ( draft ) return this.InvoiceStatus.DRAFT;
        if ( paymentMethod === this.PaymentStatus.VOID ) return this.InvoiceStatus.VOID;
        if ( paymentMethod === this.PaymentStatus.PROCESSING ) return this.InvoiceStatus.PROCESSING;
        if ( paymentMethod === this.PaymentStatus.CHEQUE ) return this.InvoiceStatus.PAID;
        if ( paymentMethod === this.PaymentStatus.NANOPAY ) return this.InvoiceStatus.PAID;
        if ( paymentMethod === this.PaymentStatus.TRANSIT_PAYMENT ) return this.InvoiceStatus.PROCESSING;
        if ( paymentMethod === this.PaymentStatus.DEPOSIT_PAYMENT ) return this.InvoiceStatus.PENDING_ACCEPTANCE;
        if ( paymentMethod === this.PaymentStatus.DEPOSIT_MONEY ) return this.InvoiceStatus.DEPOSITING_MONEY;
        if ( paymentMethod === this.PaymentStatus.PENDING_APPROVAL ) {
          if (this.user.id === this.payeeId ) return this.InvoiceStatus.UNPAID;
          else return this.InvoiceStatus.PENDING_APPROVAL;
        }
        if ( paymentMethod === this.PaymentStatus.REJECTED ) return this.InvoiceStatus.REJECTED;
        if ( paymentDate > Date.now() && paymentId == 0 ) return (this.InvoiceStatus.SCHEDULED);
        if ( dueDate ) {
          if ( dueDate.getTime() < Date.now() ) return this.InvoiceStatus.OVERDUE;
          if ( dueDate.getTime() < Date.now() + 24*3600*7*1000 ) return this.InvoiceStatus.UNPAID;
        }
        return this.InvoiceStatus.UNPAID;
      },
      javaGetter: `
        if ( getDraft() ) return InvoiceStatus.DRAFT;

        switch ( getPaymentMethod() ) {
          case PROCESSING:
          case TRANSIT_PAYMENT:
            return InvoiceStatus.PROCESSING;
          case CHEQUE:
          case NANOPAY:
            return InvoiceStatus.PAID;
          case VOID:
            return InvoiceStatus.VOID;
          case DEPOSIT_PAYMENT:
            return InvoiceStatus.PENDING_ACCEPTANCE;
          case DEPOSIT_MONEY:
            return InvoiceStatus.DEPOSITING_MONEY;
          case PENDING_APPROVAL:
            return InvoiceStatus.PENDING_APPROVAL;
          case REJECTED:
            return InvoiceStatus.REJECTED;
          case QUOTED:
            return InvoiceStatus.QUOTED;
          case SUBMIT:
            return InvoiceStatus.SUBMIT;
        }

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
      tableWidth: 130
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'invoiceFile',
      label: 'Attachment',
      section: 'invoiceInformation',
      tableWidth: 100,
      documentation: 'A stored copy of the original invoice document.',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' },
      tableCellFormatter: function(files) {
        if ( ! (Array.isArray(files) && files.length > 0) ) return;
        var actions = files.map((file) => {
          return foam.core.Action.create({
            label: file.filename,
            code: function() {
              window.open(file.address, '_blank');
            }
          });
        });
        this.tag({
          class: 'foam.u2.view.OverlayActionListView',
          data: actions,
          obj: this,
          activeImageURL: '/images/attachment-purple.svg',
          restingImageURL: '/images/attachment.svg',
          hoverImageURL: '/images/attachment.svg',
          disabledImageURL: '/images/attachment.svg',
        });
      },
      javaToCSV: `
        StringBuilder sb = new StringBuilder();
        foam.nanos.fs.File[] filesList = get_(obj);
        foam.nanos.fs.File file;

        sb.append("[");
        for(int i = 0; i < filesList.length; i++ ) {
          if ( i != 0 ) sb.append(",");
          file = filesList[i];
          sb.append(file.isPropertySet("address") ? file.getAddress() : file.getFilename());
        }
        sb.append("]");
        outputter.outputValue(sb.toString());
      `
    },
    {
      class: 'Boolean',
      name: 'scheduledEmailSent',
      section: 'invoiceInformation',
      documentation: `Determines whether an email has been sent to the Payer
        informing them that the payment they scheduled is due.`,
      value: false,
      includeInDigest: true
    },
    {
      class: 'String',
      name: 'referenceId',
      section: 'invoiceInformation',
      documentation: `The unique identifier for sent and received form email.`,
      includeInDigest: true,
      factory: function() {
        return foam.uuid.randomGUID();
      },
      javaFactory: `
        return UUID.randomUUID().toString();
      `
    },
    {
      // TODO/REVIEW - used?
      class: 'Boolean',
      name: 'removed',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: 'Determines whether an invoice has been removed.',
      includeInDigest: false
    },
    {
      class: 'Reference',
      targetDAOKey: 'contactDAO',
      of: 'net.nanopay.contacts.Contact',
      name: 'contactId',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      value: 0,
      documentation: `The unique identifier for the Contact, representing people who,
        although they are not registered on the platform, can still receive invoices from
        platform users.`,
      includeInDigest: true,
      view: function(_, X) {
        return foam.u2.view.RichChoiceView.create({
          selectionView: {
            class: 'net.nanopay.auth.ui.UserSelectionView',
            emptySelectionLabel: X.data.SELECT_CONTACT
          },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              dao: X.user.contacts.orderBy(foam.nanos.auth.User.ORGANIZATION),
              searchBy: [
                net.nanopay.contacts.Contact.ORGANIZATION,
                net.nanopay.contacts.Contact.OPERATING_BUSINESS_NAME
              ]
            }
          ]
        }, X);
      }
    },
    {
      class: 'Boolean',
      name: 'isSyncedWithAccounting',
      visibilityPermissionRequired: true,
      section: 'accountingInformation',
      factory: function() {
        return net.nanopay.accounting.xero.model.XeroInvoice.isInstance(this) ||
        net.nanopay.accounting.quickbooks.model.QuickbooksInvoice.isInstance(this);
      },
      documentation: 'Checks if invoice has been synced with accounting software.',
      visibility: 'RO',
      includeInDigest: false,
    },
    {
      name: 'lineItems',
      class: 'FObjectArray',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      of: 'net.nanopay.invoice.InvoiceLineItem',
      javaValue: 'new InvoiceLineItem[] {}',
      includeInDigest: false,
      visibility: 'RO',
      view: {
        class: 'foam.u2.view.TitledArrayView',
        valueView: 'foam.u2.CitationView'
      }
    },
    {
      class: 'Boolean',
      name: 'payeeReconciled',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'accountingInformation',
      documentation: `Determines whether invoice has been reconciled by payee.
          Verifies that the receive amount is correct.`
    },
    {
      class: 'Boolean',
      name: 'payerReconciled',
      visibilityPermissionRequired: true,
      includeInDigest: true,
      section: 'accountingInformation',
      documentation: `Determines whether invoice has been reconciled by payer.
          Verifies that the sent amount is correct.`
    },
    {
      class: 'FObjectArray',
      name: 'transactionHistory',
      includeInDigest: false,
      visibilityPermissionRequired: true,
      section: 'transactionInformation',
      of: 'net.nanopay.tx.model.Transaction',
      view: { class: 'foam.u2.view.DAOtoFObjectArrayView' },
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'processPaymentOnCreate',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation',
      documentation: `When set to true, on invoice submit a transaction will be planned and submitted.
          If the transaction require fx, current rates will be used and there will NOT be a chance to review these rates.
          Send required lineitems using the 'transactionLineItems' property if required.
        `,
      storageTransient: true,
      value: false
    },
    {
      class: 'FObjectArray',
      name: 'transactionLineItems',
      visibilityPermissionRequired: true,
      of: 'net.nanopay.tx.TransactionLineItem',
      hidden: 'true',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionQuote',
      name: 'quote',
      visibilityPermissionRequired: true,
      hidden: true,
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'requestTransaction',
      visibilityPermissionRequired: true,
      hidden: true,
      storageTransient: true,
      networkTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plan',
      visibilityPermissionRequired: true,
      hidden: true,
      storageTransient: true,
    },
    {
      class: 'String',
      name: 'totalSourceAmount',
      visibilityPermissionRequired: true,
      includeInDigest: false,
      section: 'invoiceInformation'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      visibilityPermissionRequired: true,
      storageTransient: true,
      javaFactory: `
        var invoiceSpidMap = new java.util.HashMap();
        invoiceSpidMap.put(
          Invoice.class.getName(),
          new foam.core.PropertyInfo[] {
            Invoice.PAYER_ID,
            Invoice.PAYEE_ID,
          }
        );
        return new ServiceProviderAwareSupport()
          .findSpid(foam.core.XLocator.get(), invoiceSpidMap, this);
      `
    },
    {
      class: 'StringArray',
      name: 'capabilityIds',
      visibilityPermissionRequired: true,
      section: 'invoiceInformation'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      writePermissionRequired: true,
      readPermissionRequired: true
    }
  ],

  messages: [
    { name: 'SELECT_CONTACT', message: 'Select contact' },
    // used in MarkAsVoidModal and InvoiceVoidEmailRule
    { name: 'ON_VOID_NOTE', message: 'On Void Note: ' }
  ],

  methods: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Method)
      .map(m => m.clone())),
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
        if ( this.getAmount() < 0 ) {
          throw new IllegalStateException("Amount must be a number and no less than zero.");
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
          if ( payee == null && ( contact == null || contact.getBusinessId() != 0 ) ) {
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
          if ( payer == null && ( contact == null || contact.getBusinessId() != 0 ) ) {
            throw new IllegalStateException("No user, contact, or business with the provided payerId exists.");
          }
          // TODO: Move user checking to user validation service
          if ( payer != null && AccountStatus.DISABLED == payer.getStatus() ) {
            throw new IllegalStateException("Payer user is disabled.");
          }
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.paymentId.split('-', 1)[0];
      },
      javaCode: `
        return this.getClass().getSimpleName();
      `
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      section: 'invoiceInformation',
      isAvailable: function(status) {
        return false;
        // return status !== this.InvoiceStatus.PAID && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
      },
      code: function(X) {
        X.stack.push({
          class: 'net.nanopay.interac.ui.etransfer.TransferWizard',
          invoice: this
        });
      }
    },
    {
      name: 'payerAccount',
      section: 'invoiceInformation',
      isAvailable: async function() {
        var acc = await this.accountDAO.find(this.destinationAccount);
        return this.acc ? this.user.id != acc.owner : false;
      },
      code: async function(X) {
        var payerAccount = await X.accountDAO.find(this.account);
        var dao = X.accountDAO.where(this.EQ(net.nanopay.account.Account.ID, payerAccount.id));
        X.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            deletePredicate: foam.mlang.predicate.False,
            browseTitle: payerAccount.name
          }
        });
      }
    },
    {
      name: 'payeeAccount',
      section: 'invoiceInformation',
      isAvailable: async function() {
        var acc = await this.accountDAO.find(this.account);
        return this.user.id != acc.owner;
      },
      code: async function(X) {
        var payeeAccount = await X.accountDAO.find(this.destinationAccount);
        var dao = X.accountDAO.where(this.EQ(net.nanopay.account.Account.ID, payeeAccount.id));
        X.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            deletePredicate: foam.mlang.predicate.False,
            browseTitle: payeeAccount.name
          }
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
    section: 'accountInformation'
  },
  targetProperty: {
    section: 'invoiceInformation',
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
            resolve(user ? user.toSummary() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.add(value && value.toSummary ? value.toSummary() : 'N/A');
    },
    javaToCSV: `
      User payee = ((Invoice)obj).findPayeeId(x);
      outputter.outputValue(payee.toSummary());
    `,
    javaToCSVLabel: `
      outputter.outputValue("Payee");
    `
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
    section: 'accountInformation'
  },
  targetProperty: {
    label: 'Customer',
    visibilityPermissionRequired: true,
    section: 'invoiceInformation',
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
            resolve(user ? user.toSummary() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.add(value && value.toSummary ? value.toSummary() : 'N/A');
    },
    javaToCSV: `
    User payer = ((Invoice)obj).findPayerId(x);
    outputter.outputValue(payer.toSummary());
    `,
    javaToCSVLabel: `
    outputter.outputValue("Payer");
    `
  },
});
