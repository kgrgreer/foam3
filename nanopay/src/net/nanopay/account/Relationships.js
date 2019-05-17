foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.OverdraftAccount',
  targetModel: 'net.nanopay.account.DebtAccount',
  forwardName: 'debts',
  inverseName: 'debtor',
  cardinality: '1:*',
  targetDAOKey: 'debtAccountDAO',
});
