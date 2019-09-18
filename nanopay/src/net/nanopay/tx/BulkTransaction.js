foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  properties: [
    {
      documentation: `When true, planners will add a Cash-In Transaction,
 rather than rely on liquidity or manual Cash-In to found the appropriate
 Digital account.`,
      name: 'explicitCI',
      class: 'Boolean',
      value: true
    },
    {
      documentation: `When true, planners will add a Cash-Out Transaction,
 rather than leave Cash-Out to be dealt with via Liquidity.`,
      name: 'explicitCO',
      class: 'Boolean',
      value: true
    }
  ]
});
