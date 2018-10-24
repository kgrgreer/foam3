foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'NotificationDashboardView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'invoiceDAO',
    'user'
  ],

  css: `
    ^ {
      margin-bottom: 4px;
      border-radius: 4px;
      padding: 8px 10px;
    }

    ^roww {
      //display: flex;
      justify-content: space-between;
      padding: 4px;
      margin-left: 50px;
      float: right;
    } 
    ^ .iconnn {
     // margin-top: 20px;
    }
  `,

  properties: [
    'data',
    {
      class: 'String',
      name: 'currencyFormatted',
      value: '...',
      documentation: `Used internally to show the formatted currency value.`
    },
    {
      name: 'bodyMsg',
      class: 'String'
    },
    {
      name: 'datte',
      class: 'String'
    },
    {
      name: 'iccon',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    }
  ],

  methods: [
    function initE() {
      // Get body msg
      this.bodyMsg = this.data.notificationType;
      if ( this.bodyMsg.includes('Invoice') ) {
        this.invoiceDAO.find(this.data.invoiceId).then(
          (invoice) => {
            if ( invoice == null ) this.bodyMsg = 'The invoice for this notification can no longer be found.';
              if ( invoice.payeeId === this.user.id ) {
                var name = invoice.payer.businessName ? invoice.payer.businessName : invoice.payer.label();
                this.bodyMsg = `Received payment from ${name} for ${this.currencyFormatted}`;
              }
              var name = invoice.payee.businessName ? invoice.payee.businessName : invoice.payee.label();
              this.bodyMsg = `Sent payment to ${name} for $${invoice.amount/100}`;
          });
      } else this.bodyMsg = this.data.body;

      // Get date
      this.datte = this.data.issuedDate ?
          this.spliceDateFormatter(this.data.issuedDate.toISOString().slice(0, 10)) : '';

      this.SUPER();
      // View output
      this.addClass(this.myClass())
        .start()
          .start(this.iccon)
            .addClass('Iconnn')
          .end()
          .start().style({ 'margin-left': '40px', 'margin-top': '-22px'  })
            .start()
              .add(this.bodyMsg$).addClass('roww')
            .end()
            .start()
              .add(this.datte$)
            .end()
          .end()
        .end();
      },

    function spliceDateFormatter(dateString) {
      let splitDate = dateString.split('-');
      let date = dateString;
      if ( splitDate.length === 3 ) {
        switch ( parseInt(splitDate[1]) ) {
          case 1:
            date = 'January';
            break;
          case 2:
            date = 'February';
            break;
          case 3:
            date = 'March';
            break;
          case 4:
            date = 'April';
            break;
          case 5:
            date = 'May';
            break;
          case 6:
            date = 'June';
            break;
          case 7:
            date = 'July';
            break;
          case 8:
            date = 'August';
            break;
          case 9:
            date = 'September';
            break;
          case 10:
            date = 'October';
            break;
          case 11:
            date = 'November';
          break;
        case 12:
          date = 'December';
          break;
        default:
          return splitDate;
      }
      return `${date} ${splitDate[2]}, ${splitDate[0]}`;
    }
    return date;
  }
  ]
});
