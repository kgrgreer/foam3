/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.creditengine',
  name: 'CreditCodeAccount',
  extends:'net.nanopay.account.Account',

  documentation: `A creditCode can create a credit line item on a given transaction or fee.
  It can also execute some logic on consumption, as well as execute some logic on a transaction update.
  It must also be able to calculate savings it applied to a given transaction.
  All creditCodes at minimum must be tied to a spid, have a UUID, and a name.`,

  javaImports: [
    'foam.nanos.session.LocalSetting',
    'foam.nanos.session.Session',
    'net.nanopay.fx.ExchangeRateService',
    'static foam.mlang.MLang.EQ',
    'foam.core.Unit'
  ],

  imports: [
    'unitDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      label: 'Credit Code Name',
      order: 10,
      javaFactory: `
        return getClass().getSimpleName();
      `,
    },
    {
      class: 'String',
      name: 'desc',
      documentation: `The given description of this Credit Code, provided by
        the credit creator`,
      label: 'Description',
      order: 20,
      section: 'accountInformation',
      createVisibility: 'RW',
      updateVisibility: 'RO',
      editVisibility: 'RO',
    },
    {
      class: 'Long',
      name: 'initialQuantity',
      value: 0,
      documentation: 'Initial amount of promos available. either "$ quantity, usage Amounts, or whatever else thats code specific',
      section: 'accountInformation',
      label: 'Initial Number of Uses Available',
      createVisibility: 'RW',
      updateVisibility: 'RO',
      editVisibility: 'RO',
      gridColumns: 6,
      order: 30,
    },
    {
      class: 'Boolean',
      name: 'codeActive',
      documentation: 'Indicates whether or nto the credit code is currently Active',
      value: false,
      createVisibility: 'RW',
      updateVisibility: 'RW',
      editVisibility: 'RW',
      section: 'accountInformation',
      order: 60
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      hidden: true
    },
    // * properties that need hiding beyond this point *
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      includeInDigest: true,
      label: 'Unit',
      targetDAOKey: 'unitDAO',
      value:'uses',
      createVisibility: 'RW',
      updateVisibility: 'RO',
      editVisibility: 'RO',
      section: 'accountInformation',
      gridColumns: 6,
      order: 40,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.unitDAO,
              heading: 'Units'
            }
          ]
        };
      }
    },
    {
      class: 'UnitValue',
      unitPropName: 'denomination',
      name: 'balance',
      label: 'Balance',
      documentation: 'A numeric value representing the available funds in the account.',
      section: 'accountInformation',
      order: 20,
      gridColumns: 6,
      storageTransient: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.unitDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      javaToCSV: `
        DAO unitDAO = (DAO) x.get("unitDAO");
        long balance  = (Long) ((Account)obj).findBalance(x);
        Unit curr = (Unit) unitDAO.find(((Account)obj).getDenomination());

        // Output formatted balance or zero
        outputter.outputValue(curr.format(balance));
      `,
      tableWidth: 175,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.add(obj.slot(function(denomination) {
          return self.E().add(foam.core.PromiseSlot.create({
            promise: this.unitDAO.find(denomination).then((result) => {
              return self.E().add(result.format(value));
            })
          }));
        }))
      }
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      documentation: `Not used here`,
      includeInDigest: false,
      section: 'operationsInformation',
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
      hidden: true,
    },
    {
      class: 'Boolean',
      name: 'transferIn',
      documentation: 'Not used',
      value: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
      hidden: true,
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      documentation: 'Not used',
      value: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
      hidden: true,
    },
    {
      class: 'String',
      name: 'homeBalance',
      documentation: 'Not used',
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
      hidden: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'Not used',
      name: 'parent',
      hidden: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'Not used',
      name: 'securitiesAccount',
      hidden: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Not used',
      value: false,
      hidden: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      editVisibility: 'HIDDEN',
    },
  ],

  methods: [
    {
      name: 'createLineItems',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.CreditLineItem[]',
      javaCode: `
        /* can be overwritten by extending class */
        return null;
      `,
      documentation: 'Create a credit line item based on the transaction as a whole'
    },
    {
      name: 'validateAmount',
      documentation: `creditCode accounts have a certain usage, and must remain positive`,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        long bal = balance == null ? 0L : balance.getBalance();

        if ( amount < 0 &&
             -amount > bal ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new RuntimeException("This promotion can not be applied");
        }
      `
    },
    {
      name: 'totalSaved',
      args: [
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Long',
      javaCode: `
      /* needs to be overwritten by extending class */
        return -1;
      `,
      documentation: 'calculates how much this promo has saved on this transaction'
    },
    {
      name: 'consume',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        //nop
      `,
      documentation: 'When the Credit code is consumed on final submission of transaction increment its usage count'
    },
    {
      name: 'onUpdate',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        //nop
      `,
      documentation: 'On a successful update to the transaction, '
    },
  ]

});
