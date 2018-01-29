foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksAccountForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form',
    'isConnecting',
    'complete'
  ],
  requires: [
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Institution',
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 497px;
        }
        ^ .accountView {
          width: 100%;
          height: 270px;
          overflow:auto;
        }
        ^ .spacer {
          margin-bottom: 10px;
        }
        ^ .spacer:last-child {
          margin-bottom: 0px;
        }
        ^ .subContent {
          width: 495px;
          height: 360px;
        }
        ^ .account {
          cursor: pointer;
        }
        ^ .account:hover{
          border: solid 1px #00FFFF;
        }
        ^ .account.selected {
          border: solid 1px red;
        }
        ^ .Nav {
          margin-top: 20px;
          width: 497px;
        }
        ^ .net-nanopay-ui-ActionView-addAccount {
          margin-left: 361px;
          width: 136px;
          height: 40px;
          background-color: #59a5d5;
          color: #ffffff;
        }
        ^ .net-nanopay-ui-ActionView-nextButton {
          float: right;
          margin: 0;
          box-sizing: border-box;
          background-color: #148F77;
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
          float: right;
          margin: 0;
          outline: none;
          border:none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: #A93226;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
          margin-right: 40px;
        }

        ^ .net-nanopay-ui-ActionView-nextButton:disabled {
          background-color: #7F8C8D;
        }

        ^ .net-nanopay-ui-ActionView-nextButton:hover:enabled {
          cursor: pointer;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Int',
      name: 'selectTick',
      value: -1000000,
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 3: Please choose the account you want to connect with nanopay.'}
  ],
  methods: [
    function init() {
      this.SUPER();
      this.complete = true;
    },

    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader', secondImg: this.bankImgs[this.viewData.selectedOption].image})
          .start('div').addClass('accountView')
            .forEach(this.viewData.accounts, function(e, index){
              this.start({class: 'net.nanopay.flinks.view.element.AccountCard', accountName : e.Title, accountNo : e.AccountNumber, balance : e.Balance.Current})
                .style({'margin-left':'20px'})
                .addClass('spacer')
                .addClass('account')
                .addClass(self.selectTick$.map(function(o) {
                  if ( ! e.isSelected || e.isSelected == false ) {
                    return '';
                  }
                  return 'selected';
                }))
                .on('click', function() {
                  if (  ! e.isSelected || e.isSelected == false ) {
                    e.isSelected = true;
                  } else {
                    e.isSelected = false;
                  }
                  self.selectTick++;
                  //console.log(self.viewData.accounts);
                })
              .end()
            })
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
      label: 'Add Account',
      isEnabled: function(isConnecting) {
        //console.log(isConnecting);
        if ( isConnecting === true ) return false;
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
      label: 'Close',
      code: function(X) {
        //console.log('close');
        //console.log('close the form');
        //console.log(X.form.goBack);
        X.form.goBack();
      }
    }
  ]
})
