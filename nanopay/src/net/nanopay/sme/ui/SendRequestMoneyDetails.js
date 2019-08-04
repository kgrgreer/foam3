foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyDetails',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The first step of the send/request money flow. Users can
                  type in the new invoice info or they can choose from
                  the existing invoices. There are 3 boolean values that
                  control hiding and displaying the attributed elements`,

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'existingButton',
    'invoice',
    'isApproving',
    'isDetailView',
    'isForm',
    'isList',
    'newButton',
    'notificationDAO',
    'predicate',
    'stack',
    'user',
    'xeroService',
    'quickbooksService',
    'accountingIntegrationUtil'
  ],

  requires: [
    'foam.u2.Element',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^ .tab-block {
      display: inline-block;
      width: 100%;
    }
    ^ .tab {
      border-radius: 4px;
      width: 240px;
      text-align: center
    }
    ^ .tab-border {
      border: solid 1.5px #604aff;
    }
    ^ .tab-right {
      float: right;
    }
    ^ .block {
      margin-bottom: 80px;
    }
    ^ .header {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    ^ .invoice-details {
      background-color: white;
      padding: 15px;
      border-radius: 4px;
    }
    ^ .invoice-title {
      font-size: 26px;
      font-weight: 900;
    }
    ^ .invoice-h2 {
      margin-top: 0;
    }
    ^ .isApproving {
      display: none;
      height: 0;
      opacity: 0;
      margin-bottom: 0;
    }
    ^ .selectionContainer {
      margin-bottom: 36px;
    }
    ^ .white-radio {
      width: 244px !important;
    }
    ^back-arrow {
      font-size: 10.7px;
    }
    ^back-area {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #8e9090;
      margin-bottom: 15px;
      width: 150px;
    }
    ^back-tab {
      margin-left: 6px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'type',
      documentation: 'Associated to the representation of wizard, payable or receivables.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAO',
      expression: function(type) {
        if ( type === 'payable' ) {
          return this.user.expenses.where(
            this.OR(
              this.EQ(this.Invoice.STATUS, this.InvoiceStatus.DRAFT),
              this.EQ(this.Invoice.STATUS, this.InvoiceStatus.UNPAID),
              this.EQ(this.Invoice.STATUS, this.InvoiceStatus.OVERDUE),
              this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_APPROVAL),
            )
          );
        }
        return this.user.sales.where(
          this.OR(this.EQ(this.Invoice.STATUS, this.InvoiceStatus.DRAFT))
        );
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(myDAO, predicate) {
        var dao = myDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
        return predicate ? dao.where(predicate) : dao;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'dataFromNewInvoiceForm',
      factory: function() {
        return this.Invoice.create({});
      },
      documentation: `
        Stores the info that the user has filled out in the "new" tab so if they
        switch to the "existing" tab and back to the "new" tab, the info they
        filled in will still be there.
        A factory is required for a new empty invoice form,
        preventing existing invoice data conflicts.
      `
    },
    {
      name: 'isDraft',
      expression: function(invoice$status) {
        return invoice$status === this.InvoiceStatus.DRAFT;
      }
    }
  ],

  messages: [
    { name: 'DETAILS_SUBTITLE', message: 'Create new or choose from existing' },
    { name: 'EXISTING_HEADER', message: 'Choose an existing ' },
    { name: 'DETAILS_HEADER', message: 'Details' },
    { name: 'BACK', message: 'Back to selection' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var newButtonLabel = `New`;
      var existingButtonLabel = `Existing`;
      this.hasBackOption = false;
      // Update the next button label
      this.nextLabel = 'Next';

      this.addClass(this.myClass())
      .startContext({ data: this })
        .start()
          .start().enableClass('isApproving', this.isApproving$).addClass('selectionContainer')
            .start('h2').addClass('invoice-h2')
              .add(this.DETAILS_SUBTITLE)
            .end()
            .start('span').addClass('resting')
              .start(this.NEW, {
                label: newButtonLabel,
                buttonStyle: 'UNSTYLED'
              })
                .addClass('white-radio').enableClass('selected', this.newButton$)
              .end()
              .start(this.EXISTING, {
                label: existingButtonLabel,
                buttonStyle: 'UNSTYLED'
              })
                .addClass('tab-right')
                .addClass('white-radio').enableClass('selected', this.existingButton$)
              .end()
            .end()
          .end()
          .start()
            .add(this.isForm$.map((bool) => {
              return ! bool ? null :
               this.E().start().addClass('block')
                  .show(this.isForm$)
                  .start().addClass('header')
                    .add(this.DETAILS_HEADER)
                  .end()
                  .tag({
                    class: 'net.nanopay.sme.ui.NewInvoiceForm',
                    type: this.type
                  })
                  .end();
            }))
            .add(this.isList$.map((bool) => {
              return ! bool ? null :
              this.E().start().addClass('block')
                .start().addClass('header')
                  .add(`${this.EXISTING_HEADER} ${this.type}`)
                .end()
                .start()
                  .addClass('invoice-list-wrapper')
                  .select(this.filteredDAO$proxy, (invoice) => {
                    return this.E()
                      .start({
                        class: 'net.nanopay.sme.ui.InvoiceRowView',
                        showQuickAction: false,
                        data: invoice
                      })
                        .on('click', async () => {
                          // check if invoice is in sync with accounting software
                          let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(invoice);
                          if ( ! updatedInvoice ) return;
                          this.isForm = false;
                          this.isList = false;
                          this.isDetailView = true;
                          this.invoice = updatedInvoice;
                          this.dataFromNewInvoiceForm = null;
                        })
                      .end();
                    })
                .end()
              .end();
            }))
            .add(this.isDetailView$.map((bool) => {
              return ! bool ? null :
              this.E().start()
                .add(this.slot((invoice) => {
                  var detailView =  this.E().addClass('block')
                    .start().hide(this.isDraft$)
                      .addClass('header')
                      .add(`${this.EXISTING_HEADER} ${this.type}`)
                    .end()
                    .start().show(this.isDraft$)
                      .addClass('header')
                      .add(this.DETAILS_HEADER)
                    .end()
                    .start()
                      .addClass(this.myClass('back-area'))
                      .start({
                        class: 'foam.u2.tag.Image',
                        data: 'images/ablii/gobackarrow-grey.svg'
                      })
                        .addClass(this.myClass('back-arrow'))
                      .end()
                      .start()
                        .addClass(this.myClass('back-tab'))
                        .add(this.BACK)
                      .end()
                      .on('click', () => {
                        this.isForm = false;
                        this.isList = true;
                        this.isDetailView = false;
                      })
                    .end();

                    if ( invoice.status.label === 'Draft' ) {
                      detailView = detailView.start({
                        class: 'net.nanopay.sme.ui.NewInvoiceForm',
                        type: this.type
                      })
                      .end();
                    } else {
                      detailView = detailView.start({
                        class: 'net.nanopay.sme.ui.InvoiceDetails',
                        invoice: this.invoice,
                        showActions: false
                      }).addClass('invoice-details')
                      .end();
                    }
                    return detailView;
                }))
            .end();
            }))
          .end()
        .end()
        .endContext();
    }
  ],

  actions: [
    {
      name: 'new',
      label: 'New',
      code: function(X) {
        if ( this.isApproving ) return;
        this.isForm = true;
        this.isList = false;
        this.isDetailView = false;
        // Get the previous temp invoice data
        if ( this.Invoice.isInstance(this.dataFromNewInvoiceForm) ) {
          this.invoice.copyFrom(this.dataFromNewInvoiceForm);
        } else {
          // if not restoring an invoice, clear fields.
          this.invoice = this.Invoice.create({});
        }
      }
    },
    {
      name: 'existing',
      label: 'Existing',
      code: function(X) {
        if ( this.isApproving ) return;
        this.isForm = false;
        this.isList = true;
        this.isDetailView = false;
        // Save the temp invoice data in a property
        if ( this.invoice.id === 0 ) { // only do this for temp invoice.
          this.dataFromNewInvoiceForm = this.invoice;
        }
      }
    }
  ]
});
