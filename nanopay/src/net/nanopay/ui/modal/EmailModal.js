
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'EmailModal',
  extends: 'foam.u2.View',

  documentation: 'Email Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ {
        width: 448px;
        margin: auto;
        font-family: Roboto;
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
        title: 'Email'
      }))
      .addClass(this.myClass())
      .start().style({ 'margin-top': '15px' })
        .start().addClass('label').add("Email Address").end()
        .start('input').addClass('full-width-input').end()
        .start().addClass('label').add("Note").end()
        .start('input').addClass('input-box').end()
        .start().addClass('blue-button').addClass('btn').add('Confirm').end()
      .end()
    } 
  ]
});