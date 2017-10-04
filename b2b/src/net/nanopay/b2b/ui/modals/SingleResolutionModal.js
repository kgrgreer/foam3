
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'SingleResolutionModal',
  extends: 'foam.u2.View',

  documentation: 'Approve/Reject Single Invoice Modal',
  
  requires: [
    'net.nanopay.b2b.ui.modals.ModalHeader',
    'net.nanopay.b2b.model.InvoiceResolution'
  ],

  imports: [
    'closeDialog',
    'user',
    'invoiceResolutionDAO'
  ],

  properties: [
    'invoice',
    'noteInput',
    'title'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 448px;
        margin: auto;
      }
      ^ .mainMessage-Text{
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-algin: left;
        color: #093649;
        margin-left: 20px;
        margin-top: 19.5px;
        margin-right: 64px;
        margin-bottom: 10px;
      }
      ^ .close-Button{
        width: 24px;
        height: 24px;
        margin-top: 5px;
        cursor: pointer;
      }
      ^ .input-Box{
        width: 408px;
        height: 60px;
        backgroud-color: #ffffff;
        border: solod 1px rgba(!64, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        font-family: Roboto;
        color: #093649;
        text-align: left;
      }
      ^ .Approve-Button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #59aadd;
        cursor: pointer;
        text-align: center;
        color: #ffffff;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        margin-top: 5px;
        margin-left: 293px;
        margin-right: 20px;
        margin-bottom: 20px;
      }
      ^modal-sub-header{
        text-align: center;
        margin-top: 10px;
      }
      ^ h2{
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 0.2px;
        color: #093649;
        display: inline-block;
        margin-left: 20px;
        float: left;
      }
      ^ p {
        line-height: 1.33;
        letter-spacing: 0.2px;
        color: #093649;
        display: inline-block;
        margin-right: 150px;
        position: relative;
        top: -2px;
      }
      ^ .foam-u2-ActionView-saveApproval{
        position: relative;
        width: 135px;
        height: 40px;
        opacity: 0.01;
        top: -45px;
        left: -5px;
        cursor: pointer;
      }
    */}
    })
  ],

  methods: [
    function initE(){
    this.SUPER();
      var self = this;

      this
      .tag(this.ModalHeader.create({
        title: this.title
      }))
      .addClass(this.myClass())
        .start()
          .start().addClass(this.myClass('modal-sub-header'))
            .start()
              .start('h2').add('Company').end()
              .start('p').add(this.invoice.toBusinessName).end()
            .end()
            .start()
              .start('h2').add('Amount').end()
              .start('p').add('$',this.invoice.amount).end()
            .end()
          .end()
          .start().addClass('mainMessage-Text').add('Note').end()
          .startContext({ data: this })
            .start(this.NOTE_INPUT).addClass('input-Box').end()
            .start().addClass('Approve-Button').add('Confirm').add(this.SAVE_APPROVAL).end()
          .endContext()
        .end()
      .end()
    } 
  ],

  actions: [
    {
      name: 'saveApproval',
      label: '',
      code: function(X){
        var self = this; 

        var res = this.InvoiceResolution.create({
          type: this.title,
          note: this.noteInput,
          invoiceId: this.invoice.id,
          userId: this.user.id
        })

        this.invoiceResolutionDAO.put(res)
        
        this.closeDialog()
      }
    }
  ]
});
