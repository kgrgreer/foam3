foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksAccountForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form'
  ],
  requires: [
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Institution',
    'foam.nanos.auth.Country'
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .accountView {
          width: 100%;
          height: 197px;
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
          height: 320px;
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
      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 3: Please choose the account you want to connect with nanopay.'}
  ],
  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Add Account';
      this.form.isEnabledButtons(true);
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
          .start('div').addClass('subHeader')
            .start({class: 'foam.u2.tag.Image', data: 'images/banks/nanopay.svg'}).addClass('firstImg').end()
            .start({class: 'foam.u2.tag.Image', data: 'images/banks/ic-connected.svg'}).addClass('icConnected').end()
            .start({class: 'foam.u2.tag.Image', data: this.bankImgs[this.viewData.selectedOption].image}).addClass('secondImg').end()
          .end()
          .start('div').addClass('accountView')
            .forEach(this.viewData.accounts, function(e){
              this.start({class: 'net.nanopay.flinks.view.element.AccountCard', accountName : e.accountName, accountNo : e.accountNo, balance : e.balance})
                .style({'margin-left':'20px'})
                .addClass('spacer')
                .addClass('account')
                .addClass(e.isSelected$.map(function(o) {
                  if ( e.isSelected == false ) {
                    return '';
                  }
                  return 'selected';
                }))
                .on('click', function() {
                  console.log('asdfasd', e);
                  if (  e.isSelected == false ) {
                    e.isSelected = true;
                  } else {
                    e.isSelected = false;
                  }
                  console.log(self.viewData.accounts);
                })
              .end()
            })
          .end()
        .end();
    }
  ]
})