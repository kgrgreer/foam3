foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquiditySettings',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.analytics.Foldable',
    'foam.nanos.auth.LastModifiedAware'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  sections: [
    {
      name: 'basicInfo'
    },
    {
      name: 'thresholds'
    },
    {
      name: 'accountsSection',
      title: 'Accounts',
      isAvailable: function(id) {
        return !! id;
      }
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  //relationship: 1:* LiquiditySettings : DigitalAccount

  //ids: ['account'],

  plural: 'Liquidity Settings',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userToEmail',
      documentation: 'The user that is supposed to receive emails for this liquidity Setting',
      section: 'basicInfo'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'cashOutFrequency',
      factory: function() { return net.nanopay.util.Frequency.DAILY; },
      documentation: 'Determines how often an automatic cash out can occur.',
      section: 'basicInfo'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'lowLiquidity',
      section: 'thresholds',
      gridColumns: 6,
      factory: function() {
        return net.nanopay.liquidity.Liquidity.create({
          rebalancingEnabled: false,
          enabled: false,
        });
      },
      javaFactory: `
        return new net.nanopay.liquidity.Liquidity.Builder(getX())
          .setRebalancingEnabled(false)
          .setEnabled(false)
          .build();
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'highLiquidity',
      section: 'thresholds',
      gridColumns: 6,
      factory: function() {
        return net.nanopay.liquidity.Liquidity.create({
          rebalancingEnabled: false,
          enabled: false,
        });
      },
      javaFactory: `
        return new net.nanopay.liquidity.Liquidity.Builder(getX())
          .setRebalancingEnabled(false)
          .setEnabled(false)
          .build();
      `,
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date'
    }
  ],
  methods: [
    {
      name: 'toSummary',
      documentation: `
        When using a reference to the accountDAO, the labels associated to it will show a chosen property
        rather than the first alphabetical string property. In this case, we are using the account name.
      `,
      code: function(x) {
        var self = this;
        return this.name;
      },
    },
    {
      name: 'doFolds',
      javaCode: `
if ( getLastModified() == null ) return;
fm.foldForState(getId()+":high", getLastModified(), getHighLiquidity().getThreshold());
fm.foldForState(getId()+":low", getLastModified(), getLowLiquidity().getThreshold());
      `
    }
  ]
});
