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
    'user'
  ],

  requires: [
    'foam.u2.Element',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.auth.PublicUserInfo',
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
    ^ .back-tab {
      margin-bottom: 15px;
      width: 150px;
      cursor: pointer;
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
      name: 'invoiceObj',
      documentation: 'Populates data depending on initial wizard access.',
      expression: function(isDetailView) {
        if ( isDetailView ) this.uploadFileData = [];
        return this.isDetailView ? this.Invoice.create({}) : this.invoice;
      }
    },
    'dataFromNewInvoiceForm'
  ],

  messages: [
    { name: 'DETAILS_SUBTITLE', message: 'Create new or choose from existing' },
    { name: 'EXISTING_LIST_HEADER', message: 'Choose an existing ' },
    { name: 'EXISTING_HEADER', message: 'Existing ' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var view = this;
      var newButtonLabel = `New  ${this.type}`;
      var existingButtonLabel = `Existing ${this.type}s`;

      this.hasSaveOption = true;
      this.hasNextOption = true;
      this.hasBackOption = false;
      // Update the next button label
      this.nextLabel = 'Next';

      this.addClass(this.myClass())
        .start()
          .start().enableClass('isApproving', this.isApproving$).addClass('selectionContainer')
            .start('h2').addClass('invoice-h2')
              .add(this.DETAILS_SUBTITLE)
            .end()
            .start().addClass('tab-block')
              .start(this.NEW, { label: newButtonLabel })
                .addClass('tab').enableClass('tab-border', this.newButton$)
              .end()
              .start(this.EXISTING, { label: existingButtonLabel })
                .addClass('tab-right')
                .addClass('tab').enableClass('tab-border', this.existingButton$)
              .end()
            .end()
          .end()

          .start()
            .start().addClass('block')
              .show(this.isForm$)
              .start().addClass('header')
                .add('Details')
              .end()
              .tag({
                class: 'net.nanopay.sme.ui.NewInvoiceForm',
                invoice$: this.invoiceObj$,
                type: this.type
              })
            .end()

            .start().addClass('header').hide(this.isDetailView$)
              .add(this.EXISTING_LIST_HEADER + this.type)
            .end()
            .start().addClass('block')
              .show(this.isList$)
              .addClass('invoice-list-wrapper')
              .select(this.filteredDAO$proxy, function(invoice) {
                return this.E()
                  .start({
                    class: 'net.nanopay.sme.ui.InvoiceRowView',
                    data: invoice
                  })
                    .on('click', function() {
                      view.isForm = false;
                      view.isList = false;
                      view.isDetailView = true;
                      view.invoice = invoice;
                    })
                  .end();
              })
            .end()

            .start()
              .show(this.isDetailView$)
              .add(this.slot(function(invoice) {
                // Enable next button
                this.hasNextOption = true;
                var detailView =  this.E().addClass('block')
                  .start().addClass('header')
                    .add(this.EXISTING_HEADER + this.type)
                  .end()
                  .start().add('← Back to selection')
                    .addClass('back-tab')
                    .on('click', () => {
                      this.isForm = false;
                      this.isList = true;
                      this.isDetailView = false;
                      // Disable next button
                      this.hasNextOption = false;
                    })
                  .end();

                  if ( invoice.status.label === 'Draft' ) {
                    detailView = detailView = detailView.start({
                      class: 'net.nanopay.sme.ui.NewInvoiceForm',
                      invoice: invoice,
                      type: this.type
                    })
                    .end();
                  } else {
                    detailView = detailView.start({
                      class: 'net.nanopay.sme.ui.InvoiceDetails',
                      invoice: invoice
                    }).addClass('invoice-details')
                    .end();
                  }

                  return detailView;
              }))
            .end()
          .end()
        .end();
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
        // Enable the save button
        this.hasSaveOption = true;
        // Enable the next button
        this.hasNextOption = true;
        // Get the previous temp invoice data
        this.invoice = this.dataFromNewInvoiceForm;
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
        // Disable the save button
        this.hasSaveOption = false;
        // Disable the next button
        this.hasNextOption = false;
        // Save the temp invoice data in a property
        this.dataFromNewInvoiceForm = this.invoice;
      }
    }
  ]
});
