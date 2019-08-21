foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankPickCurrencyView',
  extends: 'foam.u2.Controller',

  imports: [
    'ctrl',
    'notify',
    'pushMenu',
    'stack',
    'user',
    'userDAO'
  ],

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  css: `
  ^ {
    background-color: /*%GREY5%*/ #f5f7fa;
  }
  ^ .bank-currency-pick-height {
    height: 100%;
    overflow-y: scroll;
  }
  ^ .bank-pick-margin {
    width: 1046px;
    margin: auto;
  }
  ^ .bank-pick-arrow {
    color: #8e9090;
  }
  ^bank-pick-back {
    cursor: pointer;
    display: inline-flex;
  }
  ^ .bank-pick-back {
    color: #8e9090;
    font-size: 16px;
    margin-left: 12px;
  }
  ^ .bank-pick-subtitle {
    display: inline-block;
    margin-bottom: 40px;
    font-size: 16px;
    font-weight: normal;
    color: #8e9090;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .positionColumn {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .stackColumn {
    width: 100%;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-flinks-view-form-FlinksInstitutionForm .optionSpacer {
    margin-right: 22px;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm {
    background-color: /*%GREY5%*/ #f5f7fa;
    margin-left: 28px;
    height: auto;
    padding: 0;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-flinks-view-form-FlinksSubHeader {
    background-color: transparent;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-flinks-view-form-FlinksSubHeader .verticalCenter {
    text-align: center;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-flinks-view-form-FlinksSubHeader .firstImg,
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-flinks-view-form-FlinksSubHeader .icConnected {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-flinks-view-form-FlinksSubHeader .secondImg {
    margin: auto;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .foam-u2-ActionView {
    background-color: /*%PRIMARY3%*/ #406dea;
  }
  .foam-u2-ActionView-closeModal {
    background-color: transparent !important;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .positionColumn {
    width: 260px;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .stackColumn,
  ^ .net-nanopay-flinks-view-form-FlinksForm .foam-u2-stack-StackView {
    height: auto;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .wizardBody {
    background-color: transparent;
    width: auto;
    margin: 0;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .subTitle {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .subTitleFlinks,
  ^ .net-nanopay-flinks-view-form-FlinksBankPadAuthorization .rowTopMarginOverride {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksInstitutionForm .optionSpacer.selected,
  ^ .net-nanopay-flinks-view-form-FlinksAccountForm .account:hover {
    border: solid 1px /*%PRIMARY3%*/ #406dea;
  }
  ^ .net-nanopay-flinks-view-form-FlinksInstitutionForm .foam-u2-ActionView-closeButton,
  ^ .net-nanopay-flinks-view-form-FlinksInstitutionForm .foam-u2-ActionView-nextButton {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksAccountForm .account.selected {
    border: solid 3px /*%PRIMARY3%*/ #406dea;
  }
  .net-nanopay-flinks-view-form-FlinksForm .institution,
  .net-nanopay-flinks-view-form-FlinksForm .subContent,
  .net-nanopay-flinks-view-form-FlinksForm .infoContainer-wizard {
    box-shadow: 0 1px 1px 0 #dae1e9;
  }
  .net-nanopay-flinks-view-form-FlinksForm .title {
    display: none !important;
  }
  ^ .net-nanopay-ui-modal-ModalHeader {
    display: none;
  }
  .top {
    margin-bottom: 30px;
    margin-top: 24px;
  }

  ^ .institutionSearchContainer {
    position:relative;
    float: right;
    margin-right: 20px;
  }
  ^ .institutionSearchContainer img {
    position: absolute;
    width: 16px;
    top: 12;
    left: 12;
    z-index: 1;
  }
  ^ .institutionSearch {
    width: 330px;
    height: 40px;
    position: relative;
    padding-left: 36px;
  }
  ^link-text {
    color: /*%PRIMARY3%*/ #406dea;
    margin-top: 0px;
    cursor: pointer;
    margin-left: 3px;
    font-size: 16px;
    display: inline-block;
  }
  ^ h1 {
    margin-bottom: 0px;
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Add a new bank' },
    { name: 'SUB_TITLE', message: 'Connect through a banking partner below, or ' },
    { name: 'CONNECT_LABEL', message: 'connect with a void check' },
    { name: 'BANK_ADDED', message: 'Your bank account was successfully added.' },
  ],

  properties: [
    {
      name: 'selection',
      class: 'Int',
      factory: function(user) {
        return this.user.address.countryId === 'CA' ? 1 : 2;
      }
    },
    {
      class: 'Boolean',
      name: 'hasCompletedIntegration',
      value: false,
      documentation: `Boolean to determine if the User has completed 
                      the integration process before`
    },
    {
      name: 'filterFor',
      class: 'String',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'Start typing to search ...',
        onKey: true
      }
    },
    {
      name: 'usdAvailable',
      class: 'Boolean'
    },
    {
      name: 'cadAvailable',
      class: 'Boolean'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.checkIntegration();
      this.addClass(this.myClass())
      .start().addClass('bank-currency-pick-height')
        .start().addClass('bank-pick-margin')
          .start().addClass('top')
            .start().addClass(this.myClass('bank-pick-back'))
              .start({
                class: 'foam.u2.tag.Image',
                data: 'images/ablii/gobackarrow-grey.svg'
              })
                .addClass('bank-pick-arrow')
              .end()
              .start().add('Go back').addClass('bank-pick-back').end()
            .on('click', () => {
              this.stack.back();
            }).end()
            .start('h1').add(this.TITLE).addClass('bank-pick-title').end()
            .start()
              .start('h4').add(this.SUB_TITLE).addClass('bank-pick-title').addClass('bank-pick-subtitle').end()
              .start('p')
                .addClass(this.myClass('link-text'))
                .add(this.CONNECT_LABEL)
                .attrs({name: "connectWithVoidCheck"})
                .on('click', function() {
                  var bankModal = self.selection == 1 ? 'net.nanopay.cico.ui.bankAccount.modalForm.AddCABankModal' :
                      'net.nanopay.bank.ui.addUSBankModal.AddUSBankModalWizard';

                  self.ctrl.add(self.Popup.create().tag({
                    class: bankModal,
                    onComplete: self.onComplete
                  }));
                })
              .end()
            .end()
            .start('span').addClass('resting')
            .startContext({ data: this })
              .start(this.CURRENCY_ONE, { buttonStyle: 'UNSTYLED' })
                .addClass('white-radio').show(this.cadAvailable)
                .enableClass('selected', this.selection$.map(function(v) { return v === 1; }))
                .style({ 'margin-left': '5px', 'margin-right': '10px' })
              .end()
              .start(this.CURRENCY_TWO, { buttonStyle: 'UNSTYLED' })
                .addClass('white-radio').show(this.usdAvailable)
                .enableClass('selected', this.selection$.map(function(v) { return v === 2; }))
                .style({ 'margin-left': '5px', 'margin-right': '5px' })
              .end()
            .endContext()
            .start().addClass('institutionSearchContainer')
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).end()
              .start(this.FILTER_FOR)
                .addClass('institutionSearch')
                .attrs({ autocomplete: 'off' })
              .end()
            .end()
            .end()
          .end()
          .start().show(this.selection$.map((v) => { return v === 1 && this.cadAvailable; }))
            .start().tag({
              class: 'net.nanopay.flinks.view.FlinksInstitutionsView',
              filterFor$: this.filterFor$,
              isSingleSelection: true,
              onComplete: this.createOnComplete()
            }).end()
          .end()

          .start().show(this.selection$.map((v) => { return v === 2 && this.usdAvailable; }))
            .start().tag({
              class: 'net.nanopay.plaid.ui.PlaidView',
              logoPath: 'images/ablii-logo.svg',
              onComplete: this.createOnComplete()
            }).end()
          .end()

        .end()
      .end();
    },

    function createOnComplete() {
      var self = this;
      return function() {
        var menuLocation = 'sme.main.banking';
        window.location.hash.substr(1) != menuLocation ? self.pushMenu(menuLocation) : self.stack.back();
        return;
      };
    },

    function createOnDismiss() {
      var self = this;
      return function() {
        self.selection = 1;
      };
    },

    async function checkIntegration() {
      var nUser = await this.userDAO.find(this.user.id);
      this.hasCompletedIntegration = nUser.hasIntegrated;
    }
  ],

  actions: [
    {
      name: 'currencyOne',
      label: 'Canada',
      isAvailable: function() {
        return this.user.address.countryId === 'CA';
      },
      code: function() {
        this.selection = 1;
      }
    },
    {
      name: 'currencyTwo',
      label: 'US',
      isAvailable: function() {
        return this.user.address.countryId === 'US';
      },
      code: function() {
        this.selection = 2;
      }
    },
  ]
});
