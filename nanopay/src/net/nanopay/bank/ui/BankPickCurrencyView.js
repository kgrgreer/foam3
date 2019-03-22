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
    background-color: #f9fbff;
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
    display: inline-block;
    vertical-align: top;
  }
  ^ .bank-pick-back {
    margin-left: 12px;
    display: inline-block;
    vertical-align: top;
    color: #8e9090;
  }
  ^ .bank-pick-title {
    margin: 10px 0;
    font-weight: 900;
  }
  ^ .bank-pick-subtitle {
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
    background-color: #f9fbff;
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
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-ui-ActionView {
    background-color: %SECONDARYCOLOR%;
  }
  .net-nanopay-ui-ActionView-closeModal {
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
    border: solid 1px %SECONDARYCOLOR%;
  }
  ^ .net-nanopay-flinks-view-form-FlinksInstitutionForm .net-nanopay-ui-ActionView-closeButton,
  ^ .net-nanopay-flinks-view-form-FlinksInstitutionForm .net-nanopay-ui-ActionView-nextButton {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-ui-ActionView.net-nanopay-ui-ActionView-closeButton {
    float: right;
    margin-right: 24px !important;
    width: auto;
    min-width: 0;
    background-color: transparent;
    color: #525455;
    border: none;
    box-shadow: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksAccountForm .account.selected {
    border: solid 3px %SECONDARYCOLOR%;
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
  `,

  messages: [
    { name: 'TITLE', message: 'Add a new bank' },
    { name: 'SUB_TITLE', message: 'Choose your banking provider below to get started' },
    { name: 'BANK_ADDED', message: 'Your bank account was successfully added' },
  ],

  properties: [
    {
      name: 'selection',
      class: 'Int',
      value: 1
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
      this.checkIntegration();
      this.addClass(this.myClass())
      .start().addClass('bank-currency-pick-height')
        .start().addClass('bank-pick-margin')
          .start().addClass('top')
            .start().style({'margin-left': '5px'})
              .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/gobackarrow-grey.svg' }).addClass('bank-pick-arrow').end()
              .start().add('Go back').addClass('bank-pick-back').end()
            .on('click', () => {
              this.stack.back();
            }).end()
            .start('h1').add(this.TITLE).addClass('bank-pick-title').end()
            .start('h4').add(this.SUB_TITLE).addClass('bank-pick-title').addClass('bank-pick-subtitle').end()
            .start('span').addClass('resting')
            .startContext({ data: this })
              .start(this.CURRENCY_ONE)
                .addClass('white-radio').show(this.cadAvailable)
                .enableClass('selected', this.selection$.map(function(v) { return v === 1; }))
                .style({ 'margin-left': '5px', 'margin-right': '10px' })
              .end()
              .start(this.CURRENCY_TWO)
                .addClass('white-radio').show(this.usdAvailable)
                .enableClass('selected', this.selection$.map(function(v) { return v === 2; }))
                .style({ 'margin-left': '5px', 'margin-right': '5px' })
              .end()
            .endContext()
            .start().addClass('institutionSearchContainer').show(this.selection$.map(function(v) { return v === 1; }))
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
              isSingleSelection: true
            }).end()
          .end()
        .end()
      .end();
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
      code: function() {
        this.selection = 1;
      }
    },
    {
      name: 'currencyTwo',
      label: 'US',
      code: function() {
        this.selection = 2;
        this.add(this.Popup.create().tag({
          class: 'net.nanopay.bank.ui.addUSBankModal.AddUSBankModalWizard',
          onDismiss: this.createOnDismiss(),
          onComplete: this.createOnComplete()
        }));
      }
    },
  ]
});
