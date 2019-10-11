foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  properties: [
    {
      class: 'Boolean',
      name: 'explicitCI',
      documentation: `
        When true, planners will add a Cash-In Transaction,
        rather than rely on liquidity or manual Cash-In to fund the appropriate
        Digital account.
      `,
      value: true
    },
    {
      class: 'Boolean',
      name: 'explicitCO',
      documentation: `
        When true, planners will add a Cash-Out Transaction,
        rather than leave Cash-Out to be dealt with via Liquidity.
      `,
      value: false
    }
  ]
});
