/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankPickCurrencyView',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'sourceCorridorDAO',
    'countryDAO',
    'ctrl',
    'notify',
    'pushMenu',
    'stack',
    'subject',
    'userDAO'
  ],

  requires: [
    'foam.core.Action',
    'foam.core.Currency',
    'foam.dao.EasyDAO',
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Country',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.payment.PaymentProviderCorridor',
    'net.nanopay.sme.ui.SMEModal'
  ],

  css: `
  ^ {
    background-color: /*%GREY5%*/ #f5f7fa;
  }
  ^ .bank-currency-pick-height {
    height: 100%;
    overflow-y: auto;
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
  ^ .property-selectedCountry {
    display: inline-block;
    width: 200px;
  }
  ^ .DefaultRowView-row {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  ^ .net-nanopay-sme-ui-SMEModal-inner {
    height: 500px;
  }
  ^ .net-nanopay-sme-ui-SMEModal-content {
    box-sizing: border-box;
    width: 600px;
    overflow-y: auto;
    padding: 30px;
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Add a new bank' },
    { name: 'SUB_TITLE', message: 'Connect through a banking partner below, or ' },
    { name: 'CONNECT_LABEL', message: 'connect with a void check' },
    { name: 'BANK_ADDED', message: 'Your bank account was successfully added' },
    { name: 'CHOOSE_COUNTRY', message: 'Please select the originating country of the bank account you would like to add.' },
    { name: 'SECTION_DETAILS_TITLE_VOID', message: 'Connect using a void check' },
    { name: 'DOMICILED_BK_ACC_COUNTRY', message: 'Domiciled bank account country' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'permittedCountries',
      factory: function() {
        return this.PromisedDAO.create({
          of: 'foam.nanos.auth.Country',
          promise: this.sourceCorridorDAO
            .select(this.MAP(this.PaymentProviderCorridor.SOURCE_COUNTRY))
            .then((sink) => {
              let countries = sink.delegate.array ? sink.delegate.array : [];
              countries.push(this.subject.user.address.countryId);
              return this.countryDAO.where(this.IN(this.Country.CODE, sink.delegate.array));
            })
        });
      }
    },
    {
      class: 'Reference',
      name: 'selectedCountry',
      of: 'foam.nanos.auth.Country',
      label: 'Country of bank account',
      documentation: 'Determines what bank view will be displayed pertaining to country.',
      // TODO: Select first country after promise resolve on permitted countries.
      view: function(_, x) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: x.data.DOMICILED_BK_ACC_COUNTRY,
              dao$: x.data.permittedCountries$
            }
          ]
        };
      },
      factory: function() {
        return this.subject.user.address.countryId;
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
      class: 'FObjectProperty',
      name: 'bankAccount',
      expression: function(selectedCountry) {
        return (foam.lookup(`net.nanopay.bank.${ selectedCountry }BankAccount`)).create({}, this);
      }
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
            .start().show(this.selectedCountry$)
              .start('h4').add(this.SUB_TITLE).addClass('bank-pick-title').addClass('bank-pick-subtitle').end()
              .start('p')
                .addClass(this.myClass('link-text'))
                .add(this.CONNECT_LABEL)
                .attrs({ name: 'connectWithVoidCheck' })
                .on('click', () => {
                  this.add(this.SMEModal.create().tag({
                    class: 'net.nanopay.account.ui.BankAccountWizard',
                    data: this.bankAccount,
                    customTitle: this.SECTION_DETAILS_TITLE_VOID,
                    useSections: ['clientAccountInformation', 'pad']
                  }));
                })
              .end()
            .end()
            .start('span').addClass('resting')
            .startContext({ data: this })
              .tag(this.SELECTED_COUNTRY).addClass('country-dropdown')
            .endContext()
            .start().addClass('institutionSearchContainer').hide(this.selectedCountry$.map((v) => v === 'US'))
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).end()
              .start(this.FILTER_FOR)
                .addClass('institutionSearch')
                .attrs({ autocomplete: 'off' })
              .end()
            .end()
            .end()
          .end()
          .start().show(this.selectedCountry$.map((v) => v === 'CA'))
            .start().tag({
              class: 'net.nanopay.flinks.view.FlinksInstitutionsView',
              filterFor$: this.filterFor$,
              isSingleSelection: true,
              onComplete: this.createOnComplete()
            }).end()
          .end()

          .start().show(this.selectedCountry$.map((v) => v === 'US'))
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
        var menuLocation = 'mainmenu.banking';
        window.location.hash.substr(1) != menuLocation ?
          self.pushMenu(menuLocation) : self.stack.back();
        return;
      };
    },

    async function checkIntegration() {
      var nUser = await this.userDAO.find(this.subject.user.id);
      this.hasCompletedIntegration = nUser.hasIntegrated;
    }
  ]
});
