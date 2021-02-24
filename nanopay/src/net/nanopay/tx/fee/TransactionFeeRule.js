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
  package: 'net.nanopay.tx.fee',
  name: 'TransactionFeeRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Rule for sending a transaction to FeeEngine when the transaction is put (CREATE) into feeEngineDAO.',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    'id',
    'name',
    'documentation',
    'enabled',
    {
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' },
      tableCellFormatter: function(value) {
        this.add(value.toString());
      }
    },
    {
      class: 'String',
      name: 'feeName',
      section: 'basicInfo',
      documentation: 'Name of a fee entry used by FeeEngine to generate a FeeLineItem'
    },
    {
      class: 'Boolean',
      name: 'sourceCurrencyAsFeeDenomination',
      label: 'Use Transaction Source Currency As Fee Denomination',
      value: false,
      section: 'basicInfo',
      postSet: function(_, n) {
        this.feeDenomination = '';
      }
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeDenomination',
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['sourceCurrencyAsFeeDenomination', 'feeDenomination'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.tx.fee.TransactionFeeRule.SOURCE_CURRENCY_AS_FEE_DENOMINATION, true),
              e.NEQ(net.nanopay.tx.fee.TransactionFeeRule.FEE_DENOMINATION, '')
            );
          },
          errorString: 'Please select fee denomination.'
        }
      ],
      visibility: function(sourceCurrencyAsFeeDenomination) {
        return sourceCurrencyAsFeeDenomination ?
          foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'String',
      name: 'feeGroup',
      section: 'basicInfo'
    },
    {
      class: 'Class',
      name: 'feeClass',
      value: 'net.nanopay.tx.FeeLineItem',
      javaValue: 'net.nanopay.tx.FeeLineItem.getOwnClassInfo()',
      view: {
        class: 'foam.u2.view.StrategizerChoiceView',
        desiredModelId: 'net.nanopay.tx.FeeLineItem'
      },
      validationPredicates: [
        {
          args: ['feeClass'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.tx.fee.TransactionFeeRule.FEE_CLASS, null);
          },
          errorString: 'Please select fee class.'
        }
      ],
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'rateName',
      section: 'basicInfo',
      documentation: 'Name of a fee entry used by FeeEngine to generate a TotalRateLineItem'
    },
    {
      class: 'Boolean',
      name: 'isInvertedRate',
      section: 'basicInfo',
      documentation: 'Set to true if the "rateName" is the inverted rate (converting from destination currency to source currency).'
    },
    {
      class: 'FObjectProperty',
      name: 'rateExpiry',
      of: 'foam.nanos.cron.TimeHMS',
      section: 'basicInfo',
      documentation: 'Expiry duration of the generated TotalRateLineItem'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'feeAccount',
      section: 'basicInfo',
      documentation: 'Set fee account to create transfers for the fee line item added.',
      writePermissionRequired: true,
      required: true
    },
    {
      name: 'priority',
      value: 100,
      visibility: 'HIDDEN'
    },
    {
      name: 'operation',
      value: 'CREATE',
      visibility: 'HIDDEN'
    },
    {
      name: 'daoKey',
      value: 'feeEngineDAO',
      visibility: 'HIDDEN'
    },
    {
      name: 'ruleGroup',
      value: 'FeeEngine',
      visibility: 'HIDDEN'
    },
    {
      name: 'after',
      value: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'action',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return new TransactionFeeRuleAction();'
    },
    {
      name: 'asyncAction',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return null;'
    },
    {
      name: 'saveHistory',
      value: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'validity',
      visibility: 'HIDDEN'
    },
    {
      name: 'spid',
      value: ''
    }
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        Account sourceAccount = ((Transaction) obj).findSourceAccount(x);
        return (sourceAccount != null) ?
          sourceAccount.findOwner(x) :
          null;
      `
    }
  ],

  classes: [
    {
      name: 'TransactionFeeRuleAction',
      implements: [ 'foam.nanos.ruler.RuleAction' ],
      methods: [
        {
          name: 'applyAction',
          javaCode: `
            var txFeeRule = (TransactionFeeRule) rule;
            new FeeEngine(txFeeRule).execute(x, (Transaction) obj);
          `
        }
      ]
    }
  ]
});
