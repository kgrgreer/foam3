foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'PreferenceView',
  extends: 'foam.u2.View',

  documentation: '2 factor Auth / Email Preferenece View',
  
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
  ^{
    width: 1280px;
    margin: auto;
  }
  ^ .tfa-Container{
    width: 960px;
    height: 80px;
    border-radius: 2px;
    background-color: #ffffff;
    margin-left: 160px;
    margin-top: 50px;
  }
  ^ .email-Container{
    width: 960px;
    height: 430px;
    border-radius: 2px;
    background-color: #ffffff;
    margin-left: 160px;
    margin-top: 20px;
  }
  ^ .check-Box{
    border: solid 1px rgba(164, 179, 184, 0.5);
    width: 14px;
    height: 14px;
    border-radius: 2px;
    margin-right: 20px;
    position: relative;
  }
  ^ .foam-u2-CheckBox{
    margin-left: 20px;
    padding-bottom: 11px;
    display: inline-block;
  }
  ^ .checkBox-Text{
    height: 16px;
    font-family: Roboto;
    font-size: 12px;
    line-height: 1.33;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    display: block;
    margin-bottom: 11px;
  }
  ^ .tfa-Text{
    width: 211px;
    height: 20px;
    margin-left: 20px;
  }
  ^ .emailPref-Text{
    width: 185px;
    height: 20px;
    margin-left: 20px;
    margin-right: 600px;
  }
  ^ .unsubscribe-Text{
    margin-top: 39px;
  }
  ^ .twoFactorDiv {
    display: inline-block;
    width: 855px;
  }
  ^ .toggleDiv {
    position: relative;
    display: inline-block;
    top: -5;
  }
  ^ .update-BTN{
    width: 135px;
    height: 40px;
    border-radius: 2px;
    font-family: Roboto;
    font-size: 14px;
    line-height: 2.86;
    letter-spacing: 0.2px;
    text-align: center;
    color: #ffffff;
    cursor: pointer;
    background-color: #59aadd;
    margin-left: 20px;
    margin-top: 19px;
  }
  ^ h1{
    opacity: 0.6;
    font-family: Roboto;
    font-size: 20px;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.3px;
    text-align: left;
    color: #093649;
    display: inline-block;
  }
  ^ h2{
    width: 150px;
    font-family: Roboto;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    display: inline-block;
  }
  ^ .status-Text{
    width: 90px;
    height: 14px;
    font-family: Roboto;
    font-size: 12px;
    letter-spacing: 0.2px;
    text-align: left;
    color: #a4b3b8;
    margin-left: 20px;
    margin-right: 770px;
    display: inline-block;
  }
  `,
  
  properties:[
    {
      class: 'Boolean',
      name: 'twoFactorEnabled',
      value: false
    },
  ],
  
  methods:[
    function initE(){
      this.SUPER();
      var self = this;
      this
      .addClass(this.myClass())

      .start()
        .start().addClass('tfa-Container')
          .start('div').addClass('twoFactorDiv')
            .start('h1').add("2 Factor Authentication").addClass('tfa-Text').end()
            .start().add(this.twoFactorEnabled$.map(function(e) { return e ? 'Status: Enabled' : 'Status: Disabled' })).addClass('status-Text').end()
          .end()
          .start('div').addClass('toggleDiv')
            .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.twoFactorEnabled$ })
          .end()
        .end()

        .start().addClass('email-Container')
          .start('div')
            .start('h1').add("Email Preferences").addClass('emailPref-Text').end()
          .end()
          .start('div').addClass('checkbox-Div')
            .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When a payment is received").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When an invoice is first seen by the other party").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When an invoice or bill requires approval").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("When an invoice or bill is overdue").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("New Features and updates").addClass('checkBox-Text')
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("Unsubscribe all").addClass('unsubscribe-Text').addClass('checkBox-Text')
            .start().addClass('update-BTN').add("Update").end()
          .end()
        .end()
      .end()
    }
  ],

  messages:[

  ],

  actions:[

  ],

})
