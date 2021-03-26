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
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'ClearingTimeRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  javaImports: [
    'net.nanopay.meter.clearing.ClearingTimesTrait',
    'net.nanopay.meter.clearing.ruler.predicate.DefaultClearingTimeRulePredicate',
    'net.nanopay.tx.cico.COTransaction'
  ],

  tableColumns: [
    'id',
    'description',
    'duration',
    'enabled'
  ],

  properties: [
    {
      class: 'String',
      name: 'description',
      tableWidth: 600,
      section: 'basicInfo'
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'HIDDEN'
    },
    {
      name: 'ruleGroup',
      value: 'ClearingTime',
      visibility: 'HIDDEN'
    },
    {
      name: 'operation',
      value: 'UPDATE',
      visibility: 'HIDDEN'
    },
    {
      name: 'predicate',
      javaFactory: 'return new DefaultClearingTimeRulePredicate();',
      visibility: 'HIDDEN'
    },
    {
      name: 'action',
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'Long',
      name: 'duration',
      value: 2,
      validationPredicates:  [
        {
          args: ['duration'],
          predicateFactory: function(e) {
            return e.GTE(net.nanopay.meter.clearing.ruler.ClearingTimeRule.DURATION, 0);
          },
          errorString: 'Clearing time duration must be zero or greater'
        }
      ],
      section: 'basicInfo'
    },
    {
      name: 'enabled',
      section: 'basicInfo'
    },
    {
      name: 'after',
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
      name: 'findAccount',
      type: 'net.nanopay.account.Account',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        return transaction instanceof COTransaction
          ? transaction.findDestinationAccount(x)
          : transaction.findSourceAccount(x);
      `
    },
    {
      name: 'incrClearingTime',
      args: [
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        if ( transaction instanceof ClearingTimesTrait ) {
          ((ClearingTimesTrait) transaction).getClearingTimes()
            .put(getClass().getSimpleName(), getDuration());
        }
      `
    }
  ]
});
