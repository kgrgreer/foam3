
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'TandCModal',
  extends: 'foam.u2.View',

  documentation: 'Terms and Conditions Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'foam.u2.dialog.NotificationMessage',
  ],
  imports: [
    'user',
    'emailDocService',
    'appConfig'
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
  ^ .iframe-container{
    width: 800px;
    border-width: 0px;
    height: 400px;
    padding: 5px;
  }
  ^ .net-nanopay-ui-modal-ModalHeader {
    width: 100%;
  } 
  ^ .net-nanopay-ui-ActionView-printButton {
    float: left;
    margin: 2px 5px 5px 25px;
  } 
  ^ .net-nanopay-ui-ActionView-EmailButton {
    float: right;
    margin: 2px 25px 5px 5px;
  } 
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;    
      debugger;
      this
      .start()
        .tag(this.ModalHeader.create({
          title: 'Terms and Conditions'
        }))
        .addClass(this.myClass())
        
        .start('iframe').addClass('iframe-container')
          .attrs({id:'print-iframe',name:'print-iframe',src:this.appConfig.service.url+"service/terms?version="+((this.exportData === undefined )?" ":this.exportData)})
        .end()
        .start('div')
          .start(this.PRINT_BUTTON).addClass('btn blue-button')
          .end()
          .callIf( this.user.email != "",function(){
            this 
            .start(self.EMAIL_BUTTON).addClass('btn blue-button')
            .end()
          })
        .end()
      .end()
    },
   
  ],
  actions:[
    {
      name: 'cancelButton',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'printButton',
      label: 'Print',
      code: function(X) {
        X.window.frames["print-iframe"].focus()
        X.window.frames["print-iframe"].print()
      }
    },
    {
      name: 'emailButton',
      label: 'Email',
      code: function(X) {
        var self = this;
        this.emailDocService.emailDoc(this.user,"nanopayTerms").then(function (result) {
          if ( ! result ) {
            throw new Error('Error sending Email');
          }
          self.add(self.NotificationMessage.create({ message: 'Email sent to ' + self.user.email }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
  ]
});