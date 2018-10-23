foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'NewInvoiceModal',
  extends: 'foam.u2.View',

  documentation: '',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notificationDAO',
    'publicUserDAO',
    'stack',
    'user'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.auth.PublicUserInfo',
  ],

  css: `
    ^ .block {
      display: inline-block;
      width: 50%;
    }
    ^ .title {
      margin-top: 15px !important;
    }
    ^ .labels {
      font-size: 14px;
      color: #093649;
    }
    ^ .customer-div {
      vertical-align: top;
      margin-top: 10px;
      width: 100%;
      display: inline-block;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 40px;
      margin-top: 10px;
    }
    ^ .upload-file {
      margin-top: 30px;
      border: 4px;
      height: 200px;
      width: 500px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    },
    'type',
    {
      name: 'userList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.publicUserDAO.where(X.data.NEQ(X.data.PublicUserInfo.ID, X.user.id)),
          placeholder: `Choose from contacts`,
          objToChoice: function(user) {
            var username = user.businessName || user.organization ||
                user.label();
            return [user.id, username + ' - (' + user.email + ')'];
          }
        });
      },
      postSet: function(ov, nv) {
        var self = this;
        this.publicUserDAO.find(nv).then(function(u) {
          self.selectedUser = u;
        });
      }
    },
  ],


  methods: [
    function initE() {
      var contactLabel = this.type === 'payable' ? 'Send to' : 'Request from';
      var addNote = this.type === 'payable' ? 'payable' : 'receivable';

      this.addClass(this.myClass()).start().style({ 'width': '500px' })
        .start().addClass('customer-div')
          .start().addClass('labels').add(contactLabel).end()
          .startContext({ data: this })
            .start(this.USER_LIST).end()
          .endContext()
        .end()

        .start().addClass('labels').add('Amount').end()
        .startContext({ data: this })
          .start(this.CURRENCY_TYPE).end()
        .endContext()
        
        .startContext({ data: this.invoice })
          .start(this.Invoice.AMOUNT).addClass('small-input-box').style({ 'display': 'block', 'width': '100%' }).end()

          .start().addClass('block')
            .start().addClass('labels').add('Invoice #').end()
            .start(this.Invoice.INVOICE_NUMBER)
              .addClass('small-input-box')
            .end()

            .start().addClass('labels').add('PO #').end()
            .start(this.Invoice.PURCHASE_ORDER)
              .addClass('small-input-box')
            .end()
          .end()

          .start().addClass('block')
            .start().addClass('labels').add('Date issued').end()
            .start(this.Invoice.ISSUE_DATE).addClass('small-input-box').end()

            .start().addClass('labels').add('Date Due').end()
            .start(this.Invoice.DUE_DATE).addClass('small-input-box').end()
          .end()

          .start({ class: 'net.nanopay.sme.ui.UploadFileModal' }).addClass('upload-file').end()
          .br()
          .start('a').add('Add note to this ' + addNote).on('click', () => {
            console.log('Clicked');
          }).end()
        .endContext()
      .end();
    }
  ]

});
