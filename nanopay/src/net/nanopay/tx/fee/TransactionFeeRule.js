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

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'feeName'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeDenomination'
    },
    {
      class: 'String',
      name: 'feeGroup'
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
      name: 'predicate',
      transient: true,
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
            if ( txFeeRule.getFeeName().isBlank() ) {
              return;
            }

            new FeeEngine(
              txFeeRule.getFeeGroup(),
              txFeeRule.getFeeDenomination()
            ).execute(x, txFeeRule.getFeeName(), (Transaction) obj);
          `
        }
      ]
    }
  ]
});
