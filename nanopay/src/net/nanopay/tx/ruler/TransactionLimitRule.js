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
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Abstract class for transaction limits, never to be instantiated.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.ValidationException',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'description',
      transient: true,
      visibility: 'RO',
      expression: function(limit, send, period) {
        return `${limit} ${send ? 'sending' : 'receiving'} ${period.label} transaction limit`;
      }
    },
    {
      name: 'ruleGroup',
      value: 'transactionLimits',
      visibility: 'RO',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      value: 'CREATE',
      visibility: 'RO',
    },
    {
      class: 'Long',
      name: 'limit',
      label: 'Maximum Transaction Size',
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['limit'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.tx.ruler.TransactionLimitRule.LIMIT, 0);
          },
          errorString: 'Please set a transaction limit.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      label: 'Apply Limit To',
      updateVisibility: 'RO',
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [true, 'Sending'],
          [false, 'Receiving'],
        ]
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      value: 'DAILY',
      section: 'basicInfo',
      label: 'Transaction Limit Time Frame'
    },
    {
      class: 'Map',
      name: 'currentLimits',
      visibility: 'RO',
      readPermissionRequired: true,
      writePermissionRequired: true,
      javaFactory: `
        return new java.util.HashMap<Object, TransactionLimitState>();
      `,
      documentation: 'Stores map of objects and current running limits.'
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'RO',
    },
    /*{ //TODO: Rule Action does not exist
      name: 'action',
      transient: true,
      javaFactory: `
        return new TransactionLimitRuleAction.Builder(getX())
          .setSend(this.getSend())
          .setLimit(this.getLimit())
          .setPeriod(this.getPeriod())
          .setCurrentLimits(this.getCurrentLimits())
          .build();
      `,
    },*/
    {
      name: 'predicate',
      transient: true
    },
    {
      name: 'spid',
      value: ''
    }
  ],

  methods: [
    {
      name: 'updateLimitAmount',
      args: [
        {
          name: 'amount',
          type: 'Long'
        },
        {
          name: 'msPeriod',
          type: 'Long'
        }
      ],
      type: 'Long',
      javaCode: `
      return Math.max(amount - msPeriod * getLimit() / getPeriod().getMs(), 0);
      `
    },
    {
      name: 'updateRule',
      type: 'foam.nanos.ruler.Rule',
      args: [
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        }
      ],
      javaCode: `
      TransactionLimitRule ret = (TransactionLimitRule) rule.fclone();
      if ( ret.getSend() != getSend() ) {
        throw new ValidationException("send property cannot be changed");
      }
      ret.clearAction();
      return ret;
      `
    }
  ]
});
