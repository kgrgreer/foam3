
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'DisputeModal',
  extends: 'foam.u2.View',

  documentation: 'Dispute Invoice Modal',

  requires: [
    'net.nanopay.common.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.invoice.ui.modal.ModalStyling'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 448px;
        margin: auto;
        font-family: Roboto;
      }
      ^ .blue-button{
        margin: 20px 20px;
        float: right;
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
        title: 'Dispute'
      }))
      .addClass(this.myClass())
        .start()
          .start().addClass('key-value-container')
            .start()
              .start().addClass('key').add("Company").end()
              .start().addClass('value').add("360 Designs Inc.").end()
            .end()
            .start()
              .start().addClass('key').add("Amount").end()
              .start().addClass('value').add("CAD $1234.56").end()
            .end()
          .end()
          .start().addClass('label').add("Note").end()
          .start('input').addClass('input-box').end()
          .start().addClass('blue-button').add('Confirm').end()
        .end()
      .end()
    } 
  ]
})