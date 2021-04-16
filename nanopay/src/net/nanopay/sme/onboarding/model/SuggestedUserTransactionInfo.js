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
  package: 'net.nanopay.sme.onboarding.model',
  name: 'SuggestedUserTransactionInfo',

  documentation: `
    Suggested user information relating to expected transaction types,
    frequency, amount and currencies. Required for KYC purposes.

    todo: Legacy Property-as of April 2020 needed to be removed and
      adjustmented to at least AdcendantFXReportsWebAgent.
      Can't test for awhile so leaving for future.
  `,
  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.sme.onboarding.model.AnnualRevenueEnum',
    'net.nanopay.sme.onboarding.model.AnnualTxnFrequencyEnum',
    'net.nanopay.sme.onboarding.model.TransactionsPurposeEnum'
  ],

  messages: [
    { name: 'GROSS_ANNUAL_SALES_ERROR', message: 'Gross annual sales required' },
    { name: 'TRANSACTION_PURPOSE_ERROR', message: 'Transaction purpose required' },
    { name: 'ANNUAL_NUMBER_ERROR', message: 'Annual number of transactions required' },
    { name: 'ANNUAL_VOLUME_ERROR', message: 'Annual volume required' }
  ],

  sections: [
    {
      name: 'backOfficeSuggestedUserTransactionInfo',
      title: '',
      permissionRequired: true
    },
    {
      name: 'clientSuggestedUserTransactionInfo',
      title: '',
      properties: [
        {
          name: 'annualRevEnum',
          gridColumns: 12
        },
        {
          name: 'transactionPurposeEnum',
          gridColumns: 12
        },
        {
          name: 'otherTransactionPurpose',
          gridColumns: 12
        },
        {
          name: 'annualTransactionFrequencyEnum',
          gridColumns: 12
        },
        {
          name: 'annualDomesticVolumeEnum',
          gridColumns: 12
        },
      ]
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'baseCurrency',
      section: 'backOfficeSuggestedUserTransactionInfo',
      documentation: `Currency based on business address.`,
      hidden: true
    },
    {
      class: 'String',
      name: 'annualRevenue',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Estimated gross annual sales',
      documentation: `Estimated annual revenue for user or business.`,
      storageTransient: true,
      javaSetter: `
        // for legacy property(annualRevenue_) migration
        // setting val since called but only setting enum value if default
        // otherwise respecting changes in enum value
        annualRevenue_ = val;
        if ( ! SafetyUtil.isEmpty(annualRevenue_) ) {
          annualRevenueIsSet_ = true;
          if ( ! annualRevEnumIsSet_ ) {
            setAnnualRevEnum(AnnualRevenueEnum.forLabel(annualRevenue_));
          }
        }
      `,
      javaGetter: `
        // api's use this property,
        // returning enum val to legacy  propery(annualRevenue)
        if ( annualRevEnumIsSet_ ) {
          return getAnnualRevEnum().getLabel();
        }
        return annualRevenue_;
      `,
      hidden: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.sme.onboarding.model.AnnualRevenueEnum',
      name: 'annualRevEnum',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Estimated gross annual sales',
      documentation: `Estimated annual revenue for user or business.`,
      view: function(_, X) {
        var choices = X.data.slot(() => {
          return this.of.VALUES.map(v => [v, v.label]);
        });
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: choices
        };
      },
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['annualRevEnum'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_REV_ENUM,
              net.nanopay.sme.onboarding.model.AnnualRevenueEnum.PLACE_HOLDER);
          },
          errorMessage: 'GROSS_ANNUAL_SALES_ERROR'
        }
      ]
    },
    {
      class: 'String',
      name: 'transactionPurpose',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Main purpose of transactions',
      documentation: `General transaction purposes.`,
      storageTransient: true,
      javaSetter: `
        // for legacy property(transactionPurpose_) migration
        // setting val since called but only setting enum value if default
        // otherwise respecting changes in enum value
        transactionPurpose_ = val;
        if ( ! SafetyUtil.isEmpty(transactionPurpose_) ) {
          transactionPurposeIsSet_ = true;
          if ( ! transactionPurposeEnumIsSet_ ) {
            var checkingIfNotOtherSelection = TransactionsPurposeEnum.forLabel(transactionPurpose_);
            if ( checkingIfNotOtherSelection == null ) setTransactionPurposeEnum(TransactionsPurposeEnum.OTHER);
            else setTransactionPurposeEnum(checkingIfNotOtherSelection);
          }
        }
      `,
      javaGetter: `
        // api's use this property,
        // returning enum val to legacy propery(transactionPurpose)
        if ( transactionPurposeEnumIsSet_ ) {
          if ( otherTransactionPurposeIsSet_ ) return getOtherTransactionPurpose();
          return getTransactionPurposeEnum().getLabel();
        }
        return transactionPurpose_;
      `,
      hidden: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.sme.onboarding.model.TransactionsPurposeEnum',
      name: 'transactionPurposeEnum',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Main purpose of transactions',
      documentation: `General transaction purposes.`,
      view: function(_, X) {
        var choices = X.data.slot(() => {
          return this.of.VALUES.map(v => [v, v.label]);
        });
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: choices
        };
      },
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['transactionPurposeEnum'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE_ENUM, 
              net.nanopay.sme.onboarding.model.TransactionsPurposeEnum.PLACE_HOLDER);
          },
          errorMessage: 'TRANSACTION_PURPOSE_ERROR'
        }
      ]
    },
    {
      class: 'String',
      name: 'otherTransactionPurpose',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Please Specify',
      visibility: function(transactionPurposeEnum) {
        return transactionPurposeEnum == net.nanopay.sme.onboarding.model.TransactionsPurposeEnum.OTHER 
          ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['transactionPurposeEnum', 'otherTransactionPurpose'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE_ENUM, 
                net.nanopay.sme.onboarding.model.TransactionsPurposeEnum.OTHER),
              e.AND(
                e.EQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE_ENUM, 
                  net.nanopay.sme.onboarding.model.TransactionsPurposeEnum.OTHER),
                e.GT(
                  foam.mlang.StringLength.create({
                    arg1: net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo
                      .OTHER_TRANSACTION_PURPOSE
                  }), 0)
              )
            );
          },
          errorMessage: 'TRANSACTION_PURPOSE_ERROR'
        }
      ]
    },
    {
      class: 'String',
      name: 'annualTransactionAmount',
      section: 'backOfficeSuggestedUserTransactionInfo',
      documentation: `Estimated annual number of transactions user or business conducts.
      BaseCurrency of this field which is set when user confirms that they do international transfers,
      is opposite (CAD - USD) of set base currency of this model.
      Legacy Property-as of April 2020`,
      hidden: true
    },
    {
      class: 'String',
      name: 'annualTransactionFrequency',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Estimated annual number of transactions',
      documentation: `Estimated annual frequency of transactions the user or business conducts.`,
      storageTransient: true,
      javaSetter: `
        // for legacy property(annualTransactionFrequency_) migration
        // setting val since called but only setting enum value if default
        // otherwise respecting changes in enum value
        annualTransactionFrequency_ = val;
        if ( ! SafetyUtil.isEmpty(annualTransactionFrequency_) ) {
          annualTransactionFrequencyIsSet_ = true;
          if ( ! annualTransactionFrequencyEnumIsSet_) {
            setAnnualTransactionFrequencyEnum(AnnualTxnFrequencyEnum.forLabel(annualTransactionFrequency_));
          }
        }
      `,
      javaGetter: `
        // api's use this property,
        // returning enum val to legacy propery(annualTransactionFrequency)
        if ( annualTransactionFrequencyEnumIsSet_ ) {
          return getAnnualTransactionFrequencyEnum().getLabel();
        }
        return annualTransactionFrequency_;
      `,
      hidden: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.sme.onboarding.model.AnnualTxnFrequencyEnum',
      name: 'annualTransactionFrequencyEnum',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Estimated annual number of transactions',
      documentation: `Estimated annual frequency of transactions the user or business conducts.`,
      view: function(_, X) {
        var choices = X.data.slot(() => {
          return this.of.VALUES.map(v => [v, v.label]);
        });
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: choices
        };
      },
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['annualTransactionFrequencyEnum'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_FREQUENCY_ENUM,
              net.nanopay.sme.onboarding.model.AnnualTxnFrequencyEnum.PLACE_HOLDER);
          },
          errorMessage: 'ANNUAL_NUMBER_ERROR'
        }
      ]
    },
    {
      class: 'String',
      name: 'annualVolume',
      section: 'backOfficeSuggestedUserTransactionInfo',
      documentation: `Estimated annual volume in USD of user or business.
      BaseCurrency of this field which is set when user confirms that they do international transfers,
      is opposite (CAD - USD) of set base currency of this model.
      Legacy Property-as of April 2020`,
      hidden: true
    },
    {
      class: 'Date',
      name: 'firstTradeDate',
      section: 'backOfficeSuggestedUserTransactionInfo',
      documentation: `Anticipated first payment date.
      Legacy Property-as of April 2020`,
      hidden: true
    },
    {
      class: 'String',
      name: 'annualDomesticTransactionAmount',
      section: 'backOfficeSuggestedUserTransactionInfo',
      documentation: `Estimated annual number of transactions user or business conducts. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)
      Legacy Property-as of April 2020`,
      value: 'N/A',
      hidden: true
    },
    {
      class: 'String',
      name: 'annualDomesticVolume',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Estimated annual volume',
      documentation: `Estimated annual volume in USD of user or business. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)`,
      storageTransient: true,
      javaSetter: `
        // for legacy property(annualDomesticVolume_) migration
        // setting val since called but only setting enum value if default
        // otherwise respecting changes in enum value
        annualDomesticVolume_ = val;
        if ( ! SafetyUtil.isEmpty(annualDomesticVolume_) ) {
          annualDomesticVolumeIsSet_ = true;
          if ( ! annualDomesticVolumeEnumIsSet_) {
            setAnnualDomesticVolumeEnum(AnnualRevenueEnum.forLabel(annualDomesticVolume_));
          }
        }
      `,
      javaGetter: `
        // api's use this property,
        // returning enum val to legacy propery(annualDomesticVolume)
        if ( annualDomesticVolumeEnumIsSet_ ) {
          return getAnnualDomesticVolumeEnum().getLabel();
        }
        return annualDomesticVolume_;
      `,
      hidden: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.sme.onboarding.model.AnnualRevenueEnum',
      name: 'annualDomesticVolumeEnum',
      section: 'backOfficeSuggestedUserTransactionInfo',
      label: 'Estimated annual volume',
      documentation: `Estimated annual volume in USD of user or business. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)`,
      view: function(_, X) {
        var choices = X.data.slot(() => {
          return this.of.VALUES.map(v => [v, v.label]);
        });
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: choices
        };
      },
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['annualDomesticVolumeEnum'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_DOMESTIC_VOLUME_ENUM,
              net.nanopay.sme.onboarding.model.AnnualRevenueEnum.PLACE_HOLDER);
          },
          errorMessage: 'ANNUAL_VOLUME_ERROR'
        }
      ],
    },
    {
      class: 'Date',
      name: 'firstTradeDateDomestic',
      section: 'backOfficeSuggestedUserTransactionInfo',
      documentation: `Anticipated first payment date.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)
      Legacy Property-as of April 2020`,
      hidden: true
    }
  ]
});
