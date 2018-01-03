foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksConnectForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 490px;
        }
        ^ .text {
          height: 16px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          margin: 0px;
        }
        ^ .input {
          width: 450px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
        }
        ^ .conditionText {
          height: 16px;
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'username',
      postSet: function(oldValue, newValue) {
        this.viewData.username = newValue;
      },
      validateObj: function(username) {
        if ( username.trim().length == 0 ) return this.errorUsername;
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: 'foam.u2.view.PasswordView',
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      },
      validateObj: function(password) {
        if ( password.trim().length == 0 ) return this.errorPassword;
      }
    },
    {
      class: 'Boolean',
      name: 'conditionAgree',
      value: false,
      postSet: function(oldValue, newValue) {
        console.log(newValue);
        this.viewData.check = newValue;
      },
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 2: Log in your bank account and securely connect with nanopay.'},
    { name: 'LoginName', message: 'Access Card No. / Username'},
    { name: 'LoginPassword', message: 'Password'},
    { name: 'errorUsername', message: 'Invalid Username'},
    { name: 'errorPassword', message: 'Invalid Password'}
  ],
  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Connect';
      this.form.isEnabledButtons(true);
      this.conditionAgree = false;
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .start('div').addClass('subHeader')
            .start({class: 'foam.u2.tag.Image', data: 'images/banks/nanopay.svg'}).addClass('firstImg').end()
            .start({class: 'foam.u2.tag.Image', data: 'images/banks/ic-connected.svg'}).addClass('icConnected').end()
            .start({class: 'foam.u2.tag.Image', data: this.bankImgs[this.viewData.selectedOption].image}).addClass('secondImg').end()
          .end()
          .start('p').addClass('text').style({ 'margin-left':'20px'})
            .add(this.LoginName)
          .end()
          .start(this.USERNAME, {onKey: true}).style({'margin-left':'20px', 'margin-top':'8px'}).addClass('input').end()
          .start('p').addClass('text').style({'margin-left':'20px', 'margin-top': '20px'})
            .add(this.LoginPassword)
          .end()
          .start(this.PASSWORD, {onKey: true}).style({'margin-left':'20px', 'margin-top':'8px'}).addClass('input').end()
          .start('div').style({'margin-top':'20px'})
            .start(this.CONDITION_AGREE).style({'height':'14px', 'width':'14px', 'margin-left':'20px', 'margin-right':'8px'}).end()
            .start('span').addClass('conditionText')
              .add('Agree to ')
              .start('span').style({'color':'#59a5d5'})
                .add('Terms & Conditions')
              .end()
            .end()
            .start('span').addClass('conditionText').style({'color':'#59a5d5', 'margin-left':'168px'})
              .add('Forgot password?')
            .end()
          .end()
        .end();
    }
  ]
})