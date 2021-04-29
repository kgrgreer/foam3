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
  name: 'Fee',

  documentation: 'Describes the fee type.',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  sections: [
    {
      name: 'basicInfo',
      title: 'Basic Info'
    },
    {
      name: '_defaultSection',
      title: 'Administrative',
      permissionRequired: true
    }
  ],

  tableColumns: [
    'id',
    'name',
    'label',
    'formula'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'name',
      required: true,
      section: 'basicInfo'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.ChargedTo',
      name: 'chargedTo',
      required: true,
      value: 'net.nanopay.tx.ChargedTo.PAYER',
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'label',
      label: 'Display Name',
      section: 'basicInfo'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.fee.FeeType',
      name: 'type',
      documentation: 'Determines fee type.',
      value: 'SENDING',
      section: 'basicInfo',
      visibility: 'HIDDEN'    // not being used in FeeEngine
    },
    {
      class: 'Class',
      name: 'feeClass',
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'rateName',
      section: 'basicInfo',
      documentation: 'Name of a fee entry used by FeeEngine to generate a Rate'
    },
    {
      class: 'Boolean',
      name: 'isInvertedRate',
      section: 'basicInfo',
      documentation: 'Set to true if the "rateName" is the inverted rate (converting from destination currency to source currency).'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'feeAccount',
      section: 'basicInfo',
      documentation: 'Set fee account to create transfers for the fee line item added.'
    },
    {
      name: 'isPassThroughFee',
      class: 'Boolean',
      value: false,
      section: 'basicInfo',
      visibility: 'HIDDEN'    // not being used in FeeEngine
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'formula',
      view: { class: 'foam.u2.view.JSONTextView' },
      tableCellFormatter: function(value) {
        this.add(value.toString());
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' },
      factory: function () {
        return foam.mlang.predicate.True.create();
      },
      javaFactory: 'return foam.mlang.MLang.TRUE;'
    },
    {
      class: 'Int',
      name: 'order',
      documentation: `Order of the fee to be evaluated. Default to 0.

        Fee Engine (FeeExpr) will evaluate fees' predicate according to the
        "order" from the smallest to the largest.

        It can be also used for setting up a default fee (without a predicate)
        that is evaluated last by setting the "order" to a number greater than
        other existing fees.`
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      storageTransient: true,
      javaFactory: `
        var feeSpidMap = new java.util.HashMap();
        feeSpidMap.put(
          Fee.class.getName(),
          new foam.core.PropertyInfo[] { Fee.FEE_RULE }
        );
        return new foam.nanos.auth.ServiceProviderAwareSupport()
          .findSpid(foam.core.XLocator.get(), feeSpidMap, this);
      `
    }
  ],

  methods: [
    {
      name: 'getFee',
      type: 'Long',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      javaCode: `
        if ( getFormula() != null ) {
          var result = getFormula().f(obj);
          if ( result instanceof Number ) {
            return Math.round(((Number) result).doubleValue());
          }
        }
        return 0l;
      `
    },
    {
      name: 'getRate',
      type: 'java.lang.Number',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      javaCode: 'return getFee(obj);'
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `
        var sb = new StringBuilder();
        sb.append(getClass().getSimpleName())
          .append(" id:").append(getId())
          .append(", name:").append(getName());

        if ( getFormula() != null ) {
          sb.append(", formula:").append(getFormula().toString());
        }
        return sb.toString();
      `
    }
  ]
 });
