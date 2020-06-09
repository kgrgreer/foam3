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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessInformationData',

  documentation: `
    This model represents the Basic Info of a Business in the onboarding model.
    It is made up of the BusinessDetailSection.
  `,

  implements: [
    'foam.core.Validatable'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.model.Business'
  ],

  imports: [
    'businessTypeDAO'
  ],

  sections: [
    {
      name: 'businessDetailsSection',
      title: 'Enter the business details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on the company…`
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'BUSINESS_TYPE_ERROR', message: 'Please select type of business.' },
    { name: 'NATURE_OF_BUSINESS_ERROR', message: 'Please select nature of business.' },
    { name: 'SOURCE_OF_FUNDS_ERROR', message: 'Please provide primary source of funds.' },
    { name: 'OPERATING_NAME_ERROR', message: 'Please enter business name.' }
  ],

  properties: [
    net.nanopay.model.Business.BUSINESS_TYPE_ID.clone().copyFrom({
      section: 'businessDetailsSection',
      label: 'Type of business',
      view: function(_, X) {
        return {
            class: 'foam.u2.view.ChoiceView',
            placeholder: 'Please select...', // this.PLACE_HOLDER, X.data.PLACE_HOLDER,
            dao: X.businessTypeDAO,
            objToChoice: function(a) {
              return [a.id, a.name];
          }
        };
      },
      validationPredicates: [
        {
          args: ['businessTypeId', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.BUSINESS_TYPE_ID, 0),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'BUSINESS_TYPE_ERROR'
        }
      ]
    }),
    {
      section: 'businessDetailsSection',
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'businessSectorId',
      documentation: 'Represents the specific economic grouping for the business.',
      label: 'Nature of business',
      view: { class: 'net.nanopay.business.NatureOfBusiness' },
      validationPredicates: [
        {
          args: ['businessSectorId', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.BUSINESS_SECTOR_ID, 0),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'NATURE_OF_BUSINESS_ERROR'
        }
      ]
    },
    net.nanopay.model.Business.SOURCE_OF_FUNDS.clone().copyFrom({
      section: 'businessDetailsSection',
      label: 'Primary source of funds',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: 'Please select...', // this.PLACE_HOLDER, X.data.PLACE_HOLDER,
            choices: [
              'Purchase of goods produced',
              'Completion of service contracts',
              'Investment Income',
              'Brokerage Fees',
              'Consulting Fees',
              'Sale of investments',
              'Inheritance',
              'Grants, loans, and other sources of financing',
              'Other'
            ]
          }
        };
      },
      validationPredicates: [
        {
          args: ['sourceOfFunds', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.crunch.onboardingModels.BusinessInformationData.SOURCE_OF_FUNDS
                }), 0),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'SOURCE_OF_FUNDS_ERROR'
        }
      ]
    }),
    {
      section: 'businessDetailsSection',
      class: 'Boolean',
      name: 'operatingUnderDifferentName',
      label: 'Does your business operate under a different name?',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
        ],
        isHorizontal: true
      }
    },
    net.nanopay.model.Business.OPERATING_BUSINESS_NAME.clone().copyFrom({
      section: 'businessDetailsSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Enter your operating name'
      },
      visibility: function(operatingUnderDifferentName) {
        return operatingUnderDifferentName ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['operatingUnderDifferentName', 'operatingBusinessName', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.OPERATING_UNDER_DIFFERENT_NAME, false),
              e.NEQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.OPERATING_BUSINESS_NAME, ""),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessInformationData.REVIEWED, false)
            );
          },
          errorMessage: 'OPERATING_NAME_ERROR'
        }
      ]
    }),
    {
      name: 'reviewed',
      class: 'Boolean',
      section: 'businessDetailsSection',
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }

        if ( ! this.getReviewed() ) {
          throw new IllegalStateException("Must confirm all data entered has been reviewed and is correct.");
        }
      `,
    }
  ]
});
