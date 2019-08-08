foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'MultiUserManagementView',
  extends: 'foam.u2.View',

  documentation: 'Multi-User Management Preferenece View',
  
  imports: [
    'auth',
    'user',
    'stack',
    'userDAO'
  ],
  exports: [ 'as data' ],
  
  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],
  
  css: `
  ^ {
    width: 1280px;
    margin: auto;
  }
  ^ .Container{
    width: 960px;
    height: 200px;
    border-radius: 2px;
    background-color: #ffffff;
    margin-left: 160px;
    margin-top: 50px;
  }
  ^ h1{
    opacity: 0.6;
    font-family: Roboto;
    font-size: 20px;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.3px;
    text-align: left;
    color: /*%BLACK%*/ #1e1f21;
    display: inline-block;
  }
  ^ h2{
    width: 150px;
    font-family: Roboto;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    text-align: left;
    color: /*%BLACK%*/ #1e1f21;
    display: inline-block;
  }
  ^ .mum-Text{
    width: 220px;
    height: 20px;
    margin-left: 20px;
    margin-right: 621px;
  }
  `,
  
  methods:[
    function initE(){
      this.SUPER();
      this
      .addClass(this.myClass())
      .start().addClass('Container')
        .start('div')
          .start('h1').add("Multi-User Management").addClass('mum-Text').end()
        .end()
      .end()
    }
  ]
})
