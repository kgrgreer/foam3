foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyDetails',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The first step of the send/request money flow. User can 
                  type in the new invoice info or they can choice from 
                  the existing invoices. There are 3 boolean values that
                  control hiding and displaying of those components`,

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'invoice',
    'isDetailView',
    'isForm',
    'notificationDAO',
    'stack',
    'user',
    'newButton',
    'existingButton'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'foam.u2.Element',
  ],

  css: `
    ^ .tab-block {
      display: inline-block;
      width: 500px;
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
      margin-top: 25px;
      width: 500px;
      margin-bottom: 120px;
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
    }
  `,

  properties: [
    'isPayable',
    'type',
    'newButtonLabel',
    'existingButtonLabel',
    'detailContainer',
    {
      class: 'Boolean',
      name: 'isList',
      value: false
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAO',
      expression: function() {
        if ( this.type === 'payable' ) {
          return this.user.expenses;
        }
        return this.user.sales;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function() {
        return this.myDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    'invoiceObj',
    'dataFromNewInvoiceForm'
  ],

  messages: [
    { name: 'DETAILS_SUBTITLE', message: 'Create new or choose from existing' },
    { name: 'EXISTING_LIST_HEADER', message: `Choose an existing ` },
    { name: 'EXISTING_HEADER', message: `Existing ` }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var view = this;
      this.newButtonLabel = `New  ${this.type}`;
      this.existingButtonLabel = `Existing ${this.type}s`;


      if ( this.isDetailView && ! this.isForm ) {
        this.invoiceObj = this.Invoice.create({});
        this.uploadFileData = [];
      } else {
        this.invoiceObj = this.invoice;
      }

      this.hasSaveOption = true;
      this.hasNextOption = true;
      this.hasBackOption = false;
      // Update the next button label
      this.nextLabel = 'Next';

      this.addClass(this.myClass())
        .start()
          .start('h2').addClass('invoice-h2')
            .add(this.DETAILS_SUBTITLE)
          .end()
          .start().addClass('tab-block')
            .start(this.NEW, { label$: this.newButtonLabel$ })
              .addClass('tab').enableClass('tab-border', this.newButton$)
            .end()
            .start(this.EXISTING, { label$: this.existingButtonLabel$ })
              .addClass('tab-right')
              .addClass('tab').enableClass('tab-border', this.existingButton$)
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

            .start().addClass('block')
              .start().addClass('header')
                .add(this.EXISTING_LIST_HEADER + this.type)
              .end()
              .show(this.isList$)
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
        this.isForm = true;
        this.isList = false;
        this.isDetailView = false;
        this.newButton = true;
        this.existingButton = false;
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
        this.isForm = false;
        this.isList = true;
        this.isDetailView = false;
        this.newButton = false;
        this.existingButton = true;
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
