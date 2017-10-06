
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'SingleResolutionModal',
  extends: 'foam.u2.View',

  documentation: 'Approve/Reject Single Invoice Modal',
  
  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'closeDialog',
    'user',
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
      ^ h2{
        font-size: 14px;
        font-weight: bold;
        color: #093649;
        display: inline-block;
        margin-left: 20px;
        float: left;
      }
      ^ p {
        color: #093649;
        display: inline-block;
        margin-right: 150px;
        position: relative;
        top: -2px;
      }
      ^ .net-nanopay-ui-ActionView-saveApproval{
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
          .start().addClass('key-value-container')
            .start()
              .start().addClass('key').add('Company').end()
              .start().addClass('value').add(this.invoiceUserName$).end()
            .end()
            .start()
              .start().addClass('key').add('Amount').end()
              .start().addClass('value').add('$', this.invoice.amount.toFixed(2)).end()
            .end()
          .end()
          .start().addClass('label').add('Note').end()
          .startContext({ data: this })
            .start(this.NOTE_INPUT).addClass('input-box').end()
            .start().addClass('blue-button').add('Confirm').add(this.SAVE_APPROVAL).end()
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

        // var res = this.InvoiceResolution.create({
        //   type: this.title,
        //   note: this.noteInput,
        //   invoiceId: this.invoice.id,
        //   userId: this.user.id
        // })

        // this.invoiceResolutionDAO.put(res)
        
        this.closeDialog()
      }
    }
  ]
});
