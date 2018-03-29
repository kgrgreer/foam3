
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'TandCModal',
  extends: 'foam.u2.View',

  documentation: 'Terms and Conditions Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
  ],
  imports: [
  ],

  exports: [
    'as data',
  ],
  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  properties: [
    'exportData'
  ],

  css:`
  ^ .container{
    height: 600px;
    background-color: #093649;
    margin-bottom: 20px;
  }
  ^ .iframe-container{
    width: 800px;
    border-width: 0px;
    height: 400px;
    padding: 5px;
  }
  ^ .net-nanopay-ui-modal-ModalHeader {
    width: 100%;
  } 
  
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;          
      this
      
      .tag(this.ModalHeader.create({
        title: 'Terms and Conditions'
      }))
      .addClass(this.myClass())
      .start('iframe').addClass('iframe-container')
        .attrs({src:"http://localhost:8080/service/terms?version="+((this.exportData === undefined )?" ":this.exportData)})
      .end()
      
    } ,
   
  ],
  actions:[
    {
      name: 'cancelButton',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
  ],
  listeners: [
    
  ]
});