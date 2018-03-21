foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksConnectForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form',
    'viewData',
    'isConnecting',
    'group',
    'logo',
    'window'
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
        ^ .subContent {
          height: 285px;
        }
        ^ .conditionText {
          height: 16px;
          font-family: Roboto;
          font-size: 11px;
          line-height: 0.1;
          letter-spacing: 0.1px;
          text-align: left;
          color: #093649;
          border: 1px solid red;
        }
        ^ .net-nanopay-ui-ActionView-nextButton {
          float: right;
          margin: 0;
          box-sizing: border-box;
          background-color: #59a5d5;
          outline: none;
          border:none;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
        }

        ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
          cursor: pointer;
        }

        ^ .net-nanopay-ui-ActionView-closeButton {
          float: left;
          margin: 0;
          outline: none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          margin-left: 1px;
        }

        ^ .net-nanopay-ui-ActionView-nextButton:disabled {
          background-color: #7F8C8D;
        }

        ^ .net-nanopay-ui-ActionView-nextButton:hover:enabled {
          cursor: pointer;
        }

        ^ .net-nanopay-ui-ActionView-goToTerm {
          text-decoration: underline;
          background: transparent;
          color: #59a5d5;
          height: 25px;
        }

        ^ .pStyle {
          width: 428px;
          height: 32px;
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          word-wrap: break-word;
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
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: 'foam.u2.view.PasswordView',
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'conditionAgree',
      value: false,
      postSet: function(oldValue, newValue) {
        //console.log(newValue);
        this.viewData.check = newValue;
      },
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 2: Login to your bank account and securely connect with nanopay.'},
    { name: 'LoginName', message: 'Access Card No. / Username'},
    { name: 'LoginPassword', message: 'Password'},
    { name: 'errorUsername', message: 'Invalid Username'},
    { name: 'errorPassword', message: 'Invalid Password'}
  ],
  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Connect';
      this.conditionAgree = false;
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader', secondImg: this.bankImgs[this.viewData.selectedOption].image})
          .start('p').addClass('text').style({ 'margin-left':'20px'})
            .add(this.LoginName)
          .end()
          .start(this.USERNAME, {onKey: true}).style({'margin-left':'20px', 'margin-top':'8px'}).addClass('input').end()
          .start('p').addClass('text').style({'margin-left':'20px', 'margin-top': '20px'})
            .add(this.LoginPassword)
          .end()
          .start(this.PASSWORD, {onKey: true}).style({'margin-left':'20px', 'margin-top':'8px'}).addClass('input').end()
          .start('div').style({'margin-top':'2px'})
            .start('div').style({'display':'inline-block','vertical-align':'top'})
              .start(this.CONDITION_AGREE).style({'height':'14px', 'width':'14px', 'margin-left':'20px', 'margin-right':'8px', 'margin-top':'15px'}).end()
            .end()
            .start('div').style({'display':'inline-block'}).addClass('pStyle')
              .add('I agree to the')
              .start(this.GO_TO_TERM).end()
              .add('and authorize the release of my Bank information to nanopay.')
            .end()
          .end()
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({'clear' : 'both'}).end();
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(isConnecting, username, password, conditionAgree) {
        if ( isConnecting == true ) return false;
        if ( username.trim().length == 0 ) return false;
        if ( password.trim().length == 0 ) return false;
        if ( conditionAgree == false ) return false;
        return true;
      },
      code: function(X) {
        //console.log('nextButton');
        this.isConnecting = true;
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'Back',
      code: function(X) {
        //console.log('close the form');
        X.form.goBack();
      }
    },
    {
      name: 'goToTerm',
      label: 'terms and conditions',
      code: function(X) {
        var self = this;
        //var alternaUrl = self.window.location.orgin + "/termsandconditions/"
        var alternaUrl = 'https://nanopay.net/termsandconditions/';
        self.window.location.assign(alternaUrl);
      }
    }
  ]
})
