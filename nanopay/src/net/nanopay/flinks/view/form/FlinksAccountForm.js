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
    'net.nanopay.model.Institution'
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 497px;
        }
        ^ .accountView {
          width: 100%;
          height: 190px;
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
          height: 285px;
        }
        ^ .account {
          cursor: pointer;
        }
        ^ .account:hover{
          border: solid 1px %ACCENTCOLOR%;
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
          margin-right: 40px;
          margin-left: 1px;
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
    },
    {
      Class: 'Array',
      name: 'selectBank'
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 3: Please choose the account you want to connect with nanopay.'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.complete = true;
      this.selectBank = new Array(this.viewData.accounts.length).fill(false);
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
              if ( (! e.TransitNumber && e.TransitNumber === '') || e.Currency !== 'CAD') return; 
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
                  if ( ! e.isSelected || e.isSelected == false ) {
                    e.isSelected = true;
                    self.selectBank[index] = true;
                    self.selectBank = foam.Array.clone(self.selectBank);
                  } else {
                    e.isSelected = false;
                    self.selectBank[index] = false;
                    self.selectBank = foam.Array.clone(self.selectBank);
                  }
                  self.selectTick++;
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
      isEnabled: function(isConnecting, selectBank) {
        if ( isConnecting === true ) return false;
        for ( var x in selectBank ) {
          if ( selectBank[x] === true ) return true;
        }
        return false;
      },
      code: function(X) {
        this.isConnecting = true;
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        X.form.goBack();
      }
    }
  ]
});
