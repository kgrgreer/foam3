/* Relationship between the creator and referralCode. The creator can create multiple
  referralCodes, each code would be for a specific application/feature. */
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.referral.ReferralCode',
  forwardName: 'referralCodes',
  inverseName: 'referrer',
  cardinality: '1:*',
  targetProperty: {
    permissionRequired: true,
    columnPermissionRequired: true,
    createVisibility: 'HIDDEN',
    updateVisibility: 'RO'
  }
});

/* Relationship between a referralCode and a user that signs up using that code.
  A user can only sign up using one referralCode*/
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.referral.ReferralCode',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'referees',
  inverseName: 'referralCode',
  cardinality: '1:*',
  sourceProperty: {
    permissionRequired: true,
    columnPermissionRequired: true,
    tableCellFormatter: { class: 'foam.u2.view.DAOCountCellFormatter' },
  },
  targetProperty: {
    createVisibility: 'HIDDEN',
    updateVisibility: 'RO'
  }
});
