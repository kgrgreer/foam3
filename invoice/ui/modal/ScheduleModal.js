
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ScheduleModal',
  extends: 'foam.u2.View',

  documentation: 'Schedule Payment Modal',

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
      ^key-value{
        margin-top: 10px;
        margin-bottom: 25px;
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
        title: 'Schedule'
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
          .start().addClass('label').add("Payment Method").end()
          .start('select').addClass('full-width-input').end()
          .start().addClass('label').add("Schedule a Date").end()
          .start('input type ="date"').addClass('full-width-input').end()
          .start().addClass('label').add("Note").end()
          .start('input').addClass('input-box').end()
          .start().addClass('blue-button').add('Confirm').end()
        .end()
      .end()
    } 
  ]
})