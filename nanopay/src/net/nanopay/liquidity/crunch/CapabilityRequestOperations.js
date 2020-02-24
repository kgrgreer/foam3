foam.ENUM({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityRequestOperations',

  values: [
    {
      name: 'ASSIGN_ACCOUNT_BASED',
      label: 'Assign Transactional Role',
    },
    {
      name: 'ASSIGN_GLOBAL',
      label: 'Assign Admin Role',
    },
    /** Hiding revoking for liquid demo
    {
      name: 'REVOKE_ACCOUNT_BASED',
      label: 'Revoke Transactional Role',
    },
    {
      name: 'REVOKE_GLOBAL',
      label: 'Revoke Admin Role',
    }
    */
  ]
});
  