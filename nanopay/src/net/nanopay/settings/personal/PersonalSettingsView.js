foam.CLASS({
  package: 'net.nanopay.settings.personal',
  name: 'PersonalSettingsView',
  extends: 'foam.u2.View',

  imports: [ 'stack' ],


  documentation: 'Settings / Personal View',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 1280px;
          margin: auto;
        }
        ^ .first_Container{
          width: 960px;
          height: 80px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-top: 30px;
          margin-left: 160px;
        }
        ^ .second-Container{
          width: 960px;
          height: 80px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-left: 160px;;
        }
        ^ .third-Container{
          width: 960px;
          height: 80px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-left: 160px;
          margin-top: 20px;
        }
        ^ .fourth-Container{
          width: 960px;
          height: 80px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-left: 160px;
          margin-top: 20px;
        }
        ^ .firstName-Text{
          margin-left: 20px;
          margin-right: 88px;
          margin-bottom: 8px;
        }
        ^ .lastName-Text{
          margin-right: 82px;
          margin-bottom: 8px;
        }
        ^ .jobTitle-Text{
          margin-bottom: 8px;
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
        ^ input{
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          padding: 10px;
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2;
          text-align: left;
          color: #093649;
        }
        ^ .firstName-Input{
          width: 215px;
          height: 40px;
          margin-left: 20px;
          margin-right: 20px;
          margin-bottom: 20px;
        }
        ^ .lastName-Input{
          width: 215px;
          height: 40px;
          margin-right: 20px;
        }
        ^ .jobTitle-Input{
          width: 450px;
          height: 40px;
        }
        ^ .emailAddress-Text{
          margin-left: 20px;
          margin-bottom: 8px;
          margin-right: 322px;
        }
        ^ .phoneNumber-Dropdown{
          width: 80px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          margin-right: 10px;
        }
        ^ .emailAddress-Input{
          width: 450px;
          height: 40px;
          margin-left: 20px;
          margin-right: 20px;
          margin-bottom: 19px;
        }
        ^ .phoneNumber-Input{
          width: 360px;
          height: 40px;
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
        ^ .expand-BTN{
          width: 135px;
          height: 40px;
          border-radous: 2px;
          background-color: #59a5d5;
          border-radius: 2px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 2.86;
          letter-spacing: 0.2px;
          text-align: center;
          color: #ffffff;
          cursor: pointer;
          display: inline-block;
          margin-right: 20px;
          margin-top: 20px;
        }
        ^ .close-BTN{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          background-color: var(--cool-grey-10);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          font-family: Roboto;
          font-size: 14px;
          line-height: 2.86;
          letter-spacing: 0.2px;
          text-align: center;
          color: #093649;
          cursor: pointer;
          display: inline-block;
          margin-right: 20px;
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
        ^ .originalPass-Text{
          width: 118px;
          height: 16px;
          margin-bottom: 8px;
          margin-left: 20px;
          margin-right: 195px;
        }
        ^ .newPass-Text{
          width: 118px;
          height: 16px;
          margin-right: 195px;
        }
        ^ .confirmPass-Text{
          width: 119px;
          height: 16px;
        }
        ^ .originalPass-Input{
          width: 293px;
          height: 40px;
          margin-left: 20px;
          margin-right: 20px;
        }
        ^ .newPass-Input{
          width: 293px;
          height: 40px;
          margin-right: 20px;
        }
        ^ .confirmPass-Input{
          width: 294px;
          height: 40px;
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
        ^ .personalProfile-Text{
          width: 141px;
          height: 20px;
          margin-left: 20px;
          margin-right: 640px;
        }
        ^ .resetPass-Text{
          width: 147px;
          height: 20px;
          margin-left: 20px;
          margin-right: 638px;
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
        ^ .expandFirstFalse-Container{
          width: 960px;
          height: 298px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-left: 160px;
          margin-bottom: 20px;
          overflow: hidden;
          transition: height 1s;
        }
        ^ .expandSecondFalse-Container{
          width: 960px;
          height: 164px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-left: 160px;
          margin-bottm: 20px;
          overflow: hidden;
          transition: height 1s;
        }
        ^ .expandFourthFalse-Container{
          width: 960px;
          height: 390px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-left: 160px;
          overflow: hidden;
          transition: height 1s;
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
        ^ .expandTrue{
          visibility: hidden;
          height: 0px;
        }
      */}
    })
  ],

  properties: [
    {
      name: "expandBox1",
      value: false
    },
    {
      name: "expandBox2",
      value: false
    },
    {
      name: "expandBox4",
      value: false
    },
    {
      class: 'Boolean',
      name: 'twoFactorEnabled',
      value: false
    }
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
      .addClass(this.myClass())

      .start()
        .start().addClass('first_Container')
          .start('h1').add("Personal profile").addClass('personalProfile-Text').end()
          .start()
            .addClass('expand-BTN').enableClass('close-BTN', this.expandBox1$.map(function(e) { return e ? false : true; }))
            .add(this.expandBox1$.map(function(e) { return e ? "Expand" : "Close"; }))
            .enableClass('', self.expandBox1 = (self.expandBox1 ? false : true))
            .on('click', function(){ self.expandBox1 = ( self.expandBox1 ? false : true ) })
          .end()
        .end()
        .start().addClass('expandFirstFalse-Container').enableClass("expandTrue", self.expandBox1$)
          .start('div')
            .start('h2').add("First name").addClass('firstName-Text').end()
            .start('h2').add("Last name").addClass('lastName-Text').end()
            .start('h2').add("Job Title").addClass('jobTitle-Text').end()
          .end()
          .start('div')
            .start('input').addClass('firstName-Input').end()
            .start('input').addClass('lastName-Input').end()
            .start('input').addClass('jobTitle-Input').end()
          .end()
          .start('div')
            .start('h2').add("Email Address").addClass('emailAddress-Text').end()
            .start('h2').add("Phone Number").end()
          .end()
          .start('div')
            .start('input').addClass('emailAddress-Input').end()
            .start('select').addClass('phoneNumber-Dropdown').end()
            .start('input').addClass('phoneNumber-Input').end()
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("Make my profile visable to public").addClass('checkBox-Text').end()
            .start().addClass('update-BTN').add("Update").end()
          .end()
        .end()

        .start().addClass('second-Container')
          .start('div')
            .start('h1').add("Reset Password").addClass('resetPass-Text').end()
            .start()
              .addClass('expand-BTN').enableClass('close-BTN', this.expandBox2$.map(function(e) { return e ? false : true; }))
              .add(this.expandBox2$.map(function(e) { return e ? 'Expand' : "Close"; }))
              .enableClass('', self.expandBox2 = (self.expandBox2 ? false : true))
              .on('click', function(){ self.expandBox2 = ( self.expandBox2 ? false : true )})
            .end()
          .end()
        .end()
        .start().addClass('expandSecondFalse-Container').enableClass("expandTrue", self.expandBox2$)
          .start('div')
            .start('h2').add("Original Password").addClass('originalPass-Text').end()
            .start('h2').add("New Password").addClass('newPass-Text').end()
            .start('h2').add("Confirm Password").addClass('confirmPass-Text').end()
          .end()
          .start('div')
            .start('input').addClass('originalPass-Input').end()
            .start('input').addClass('newPass-Input').end()
            .start('input').addClass('confirmPass-Input').end()
          .end()
          .start().addClass('update-BTN').add("Update").end()
        .end()

        .start().addClass('third-Container')
          .start('div').addClass('twoFactorDiv')
            .start('h1').add("2 Factor Authentication").addClass('tfa-Text').end()
            .start().add(this.twoFactorEnabled$.map(function(e) { return e ? 'Status: Enabled' : 'Status: Disabled' })).addClass('status-Text').end()
          .end()
          .start('div').addClass('toggleDiv')
            .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.twoFactorEnabled$ })
          .end()
        .end()

        .start().addClass('fourth-Container')
          .start('div')
            .start('h1').add("Email Prefrences").addClass('emailPref-Text').end()
            .start()
              .addClass('expand-BTN').enableClass('close-BTN', this.expandBox4$.map(function(e) { return e ? false : true; }))
              .add(this.expandBox4$.map(function(e) { return e ? 'Expand' : "Close"; }))
              .enableClass('', self.expandBox4 = (self.expandBox4 ? false : true))
              .on('click', function(){ self.expandBox4 = ( self.expandBox4 ? false : true )})
            .end()
          .end()
        .end()
        .start().addClass('expandFourthFalse-Container').enableClass("expandTrue", self.expandBox4$)
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
    },
  ]
});
