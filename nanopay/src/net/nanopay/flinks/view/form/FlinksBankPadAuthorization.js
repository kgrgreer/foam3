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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksBankPadAuthorization',
  extends: 'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',

  imports: [
    'accountDAO as bankAccountDAO',
    'bannerizeCompliance',
    'fail',
    'form',
    'isConnecting',
    'notify',
    'padCaptureDAO',
    'pushMenu',
    'pushViews',
    'validateAddress',
    'validateCity',
    'validatePostalCode',
    'validateStreetNumber'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.model.PadCapture'
  ],

  axioms: [
    { class: 'net.nanopay.cico.ui.bankAccount.form.BankPADAuthorizationCSSAxiom' },
  ],

  css: `
    ^ .foam-u2-ActionView-nextButton {
      float: right;
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

    ^ .foam-u2-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }

    ^ .foam-u2-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-left: 1px;
    }

    ^ .actionContainer {
      margin-top: 15px;
      height: 40px;
      width: 536px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.
      addClass(this.myClass())
      .start('div').addClass('actionContainer')
        .tag(this.NEXT_BUTTON)
        .tag(this.CLOSE_BUTTON)
      .end();
    },
    function validateInputs() {
      var user = this.viewData.user;

      if ( user.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( user.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateStreetNumber(user.address.streetNumber) ) {
        this.notify('Invalid street number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAddress(user.address.streetName) ) {
        this.notify('Invalid street number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateCity(user.address.city) ) {
        this.notify('Invalid city name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePostalCode(user.address.postalCode, user.address.countryId) ) {
        this.notify('Invalid postal code.', '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },
    async function capturePADAndPutBankAccounts() {
      var user = this.viewData.user;
      this.isConnecting = true;

      for ( var account of this.viewData.bankAccounts ) {
        try {

          await this.padCaptureDAO.put(this.PadCapture.create({
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user.id,
            address: user.address,
            agree1: this.viewData.agree1,
            agree2: this.viewData.agree2,
            agree3: this.viewData.agree3,
            institutionNumber: account.institutionNumber,
            branchId: account.branchId, // branchId = transit number
            accountNumber: account.accountNumber
          }));
          account.address = user.address;
          account.bankAddress = this.bankAddress;
          await this.bankAccountDAO.put(account);
        } catch (error) {
          this.notify(error.message, '', this.LogLevel.ERROR, true);
          return;
        } finally {
          this.isConnecting = false;
        }
        this.bannerizeCompliance();
        this.pushViews('Complete');
      }
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'I Agree',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: function(X) {
        if ( this.validateInputs() ) {
          this.capturePADAndPutBankAccounts().then(() => {
            this.error ? this.ctrl.notify(this.error, '', this.LogLevel.ERROR, true) : this.ctrl.notify(this.SUCCESS, '', this.LogLevel.INFO, true);

            X.closeDialog();

            this.pushMenu('mainmenu.banking');
          });
        }
      }
    },
    {
      name: 'closeButton',
      label: 'Cancel',
      code: function(X) {
        X.form.stack.back();
      }
    }
  ]
});
