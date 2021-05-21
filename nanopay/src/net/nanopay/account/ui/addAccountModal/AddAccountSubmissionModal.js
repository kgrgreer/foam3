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
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AddAccountSubmissionModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for the submission of a created account',

  requires: [
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.account.ui.addAccountModal.components.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.components.ModalProgressBar',
    'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityMode',
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  imports: [
    'accountDAO',
    'liquiditySettingsDAO',
    'user'
  ],

  messages: [
    { name: 'TITLE_1', message: 'Creating your account...' },
    { name: 'TITLE_2', message: 'Your new account has been successfully created!' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'percentage',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'isUploading',
      value: true
    },
    {
      class: 'String',
      name: 'title',
      factory: function() {
        return this.TITLE_1;
      }
    },
    'progressBar'
  ],

  methods: [
    function init() {
      this.SUPER();

      var self = this;
      this.onDetach(this.isUploading$.sub(function(){
        // TODO: Make this more robust to handle more situations
        self.title = self.isUploading ? self.TITLE_1 : self.TITLE_2;
      }));
    },

    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title$: this.title$, forceHideBack: true, forceHideClose: true }).end()
        .start(this.ModalProgressBar, { isIndefinite: true }, this.progressBar$).end()
        .start().addClass(this.myClass('outer-ring')) // Margin for outer ring + border + padding for inner circle
          .start().addClass(this.myClass('inner-ring')) // Inner circle
            .start({ class: 'foam.u2.tag.Image', data: 'images/gray-check.svg'}).end()
          .end()
        .end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end();
      this.submitInformation();
    },

    async function submitInformation() {
      var account = this.createAccount();

      if ( this.viewData.accountLimitForm ) {
        // accountLimits are being specified. Apply.
        var maximumTransactionLimit = this.viewData.accountLimitForm.maxTransactionSize;
        // TODO: Apply account transaction limit
      }

      // If liquidity settings have been specified
      if ( this.viewData.liquidityForm ) {
        var uploadedLiquiditySettingsId = await this.uploadLiquiditySettings();
        account.liquiditySetting = uploadedLiquiditySettingsId;
      }

      await this.accountDAO.put(account);

      this.progressBar.stopAnimation();
      this.isUploading = false;
    },

    function createAccount() {
      var account;
      switch ( this.viewData.accountTypeForm.accountTypePicker ) {
        case net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.SHADOW_ACCOUNT :
          account = this.ShadowAccount.create();
          break;
        case net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.AGGREGATE_ACCOUNT :
          account = this.AggregateAccount.create();
          break;
        default:
          account = this.DigitalAccount.create();
      }

      // TODO: Please allow user to set the owner of account
      account.owner = this.user.id;

      var accountType = this.viewData.accountTypeForm.accountTypePicker
      var accountDetails = this.viewData.accountDetailsForm;

      account.name = accountDetails.accountName;
      // TODO: Add memo to account (currently doesn't currently have the property)
      account.desc = accountDetails.memo;

      if ( accountType != net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.SHADOW_ACCOUNT) {
        // In Liquid, no shadow should have a parent
        account.parent = accountDetails.parentAccountPicker;
      }

      if ( accountType != net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.AGGREGATE_ACCOUNT) {
        // Aggregate accounts do not need country or denomination
        // but both Shadow and Virtual require them
        account.country = accountDetails.countryPicker;
        account.denomination = accountDetails.currencyPicker;
      }

      if ( accountType == net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.SHADOW_ACCOUNT) {
        // Shadow has an associated bank account
        account.bank = accountDetails.bankAccountPicker;
      }

      return account;
    },

    async function uploadLiquiditySettings() {
      var form = this.viewData.liquidityForm;

      // Pre-existing liquidity threshold chosen
      if ( form.isExistingSelected ) {
        var existingThreshold = form.existingRuleDetails;
        return existingThreshold.existingThresholdRule;
      }

      // New Liquidity Settings
      var liquiditySettings = this.LiquiditySettings.create();

      var newRuleDetails = form.newRuleDetails;

      // Notifications only or with auto transaction
      var mode = newRuleDetails.liquidityThresholdRules;

      // Person to receive notification
      liquiditySettings.userToEmail = newRuleDetails.whoReceivesNotification;

      // Set frequency to Per Transaction
      liquiditySettings.cashOutFrequency = net.nanopay.util.Frequency.PER_TRANSACTION;

      var ruleDetails = newRuleDetails.liquidityThresholdDetails;

      // If liquidity settings should be saved under a name
      if ( ruleDetails.saveRuleAsTemplate ) {
        liquiditySettings.name = ruleDetails.saveRuleAsTemplate.thresholdRuleName ? ruleDetails.saveRuleAsTemplate.thresholdRuleName : '';
      }

      // If high threshold liquidity settings exist
      if ( ruleDetails.ceilingRuleDetails ) {
        var ceilingRules = ruleDetails.ceilingRuleDetails;
        liquiditySettings.highLiquidity.threshold = ceilingRules.accountBalanceCeiling;
        // If automatic rebalancing is needed
        if ( mode === net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityMode.NOTIFY_AND_AUTO ) {
          liquiditySettings.highLiquidity.enableRebalancing = true;
          liquiditySettings.highLiquidity.resetBalance = ceilingRules.resetAccountBalanceCeiling;
          liquiditySettings.highLiquidity.pushPullAccount = ceilingRules.ceilingMoveFundsTo;
        }
      }

      // If low threshold liquidity settings exist
      if ( ruleDetails.floorRuleDetails ) {
        var floorRules = ruleDetails.floorRuleDetails;
        liquiditySettings.lowLiquidity.threshold = floorRules.accountBalanceFloor;
        // If automatic rebalancing is needed
        if ( mode === net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityMode.NOTIFY_AND_AUTO ) {
          liquiditySettings.lowLiquidity.enableRebalancing = true;
          liquiditySettings.lowLiquidity.resetBalance = floorRules.resetAccountBalanceFloor;
          liquiditySettings.lowLiquidity.pushPullAccount = floorRules.floorMoveFundsFrom;
        }
      }

      var uploadedLiquiditySettings = await this.liquiditySettingsDAO.put(liquiditySettings);
      return uploadedLiquiditySettings.id;
    }
  ],

  actions: [
    {
      name: 'next',
      label: 'Finish',
      isEnabled: function(isUploading) {
        return ! isUploading;
      },
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
