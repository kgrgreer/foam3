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
  package: 'net.nanopay.partner.treviso',
  name: 'TrevisoBusinessAccountData',

  documentation: `Business account information, such as customer or supplier detail and taxes date`,

  javaImports: [
    'net.nanopay.crunch.onboardingModels.CustomerBasicInformation'
  ],

  sections: [
    {
      name: 'accountingSection',
      title: 'Ownership and tax information'
    }
  ],

  messages: [
    { name: 'INVALID_DATE_ERROR', message: 'Valid date required' },
    { name: 'MAX_DATE_ERROR', message: 'Cannot be a future date' },
    { name: 'YES', message: 'Yes' },
    { name: 'NO', message: 'No' },
    { name: 'FOREIGN', message: 'Foreign' },
    { name: 'NATIONAL', message: 'National' },
    { name: 'MIXED', message: 'Mixed' },
    { name: 'STATE', message: 'State' },
    { name: 'PRIVATE', message: 'Private' },
    { name: 'NO_CAPITAL_SOURCE', message: 'Source of capital required' },
    { name: 'NO_CAPITAL_TYPE', message: 'Capital type required' }
  ],

  properties: [
    {
      section: 'accountingSection',
      name: 'ownerManagment',
      label: 'Does the owner manage the business?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      name: 'simpleTax',
      label: 'Does your business opt for Simple Tax?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      name: 'isTaxFiled',
      label: 'Has this business registered a Balance, DRE or declared DEFIS?',
      class: 'Boolean',
      postSet: function(_, n) {
        if ( ! n )
          this.dateOfFilingTaxes = null;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      class: 'Date',
      name: 'dateOfFilingTaxes',
      label: 'When did the business last file taxes?',
      help: 'Date of the last registration or declaration or Balance, DRE or declared DEFIS',
      documentation: 'The date the last time you filed taxes',
      visibility: function(isTaxFiled) {
        return isTaxFiled ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      required: true,
      validationPredicates: [
        {
          args: ['dateOfFilingTaxes', 'isTaxFiled'],
          predicateFactory: function(e) {
            return  e.OR(
                e.NEQ(net.nanopay.partner.treviso.TrevisoBusinessAccountData.DATE_OF_FILING_TAXES, null),
                e.EQ(net.nanopay.partner.treviso.TrevisoBusinessAccountData.IS_TAX_FILED, false)
            );
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['dateOfFilingTaxes', 'isTaxFiled'],
          predicateFactory: function(e) {
            return e.OR(
              e.LTE(net.nanopay.partner.treviso.TrevisoBusinessAccountData.DATE_OF_FILING_TAXES, new Date()),
              e.EQ(net.nanopay.partner.treviso.TrevisoBusinessAccountData.IS_TAX_FILED, false)
            );
          },
          errorMessage: 'MAX_DATE_ERROR'
        }
      ]
    },
    {
      section: 'accountingSection',
      name: 'publiclyTraded',
      label: 'Is the business a publicly held company?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      name: 'nonprofitEntity',
      label: 'Is your business considered a non-profit entity?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      name: 'capitalSource',
      label: 'What is the primary source of capital for your business?',
      class: 'String',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            X.data.FOREIGN,
            X.data.NATIONAL,
            X.data.MIXED
          ],
          isHorizontal: true
        };
      },
      factory: function() {
        return this.NATIONAL;
      },
      validationPredicates: [
        {
          errorMessage: 'NO_CAPITAL_SOURCE',
          args: ['capitalSource'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.partner.treviso.TrevisoBusinessAccountData.CAPITAL_SOURCE, null);
          }
        }
      ]
    },
    {
      section: 'accountingSection',
      name: 'capitalType',
      label: 'How is your business funded?',
      class: 'String',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            X.data.STATE,
            X.data.PRIVATE,
            X.data.MIXED
          ],
          isHorizontal: true
        };
      },
      factory: function() {
        return this.PRIVATE;
      },
      validationPredicates: [
        {
          errorMessage: 'NO_CAPITAL_TYPE',
          args: ['capitalType'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.partner.treviso.TrevisoBusinessAccountData.CAPITAL_TYPE, null);
          }
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `,
    }
  ]
});
