foam.CLASS({
  name: 'User',
  refines: 'foam.nanos.auth.User',
  properties: [
    {
      class: 'FObjectArray',
      of:    'net.nanopay.common.model.Phone',
      name:  'phone'
    },
    {
      class: 'Date',
      name:  'birthday'
    },
    {
      class: 'String',
      name:  'profilePicture'
    },
    {
      class: 'FObjectArray',
      of:    'net.nanopay.common.model.Address',
      name:  'address'
    },
    {
      class: 'FObjectArray',
      of:    'net.nanopay.common.model.Account',
      name:  'account'
    },
    {
      class: 'FObjectProperty',
      of: 'Transaction',
      name:  'transactions'
    },
  ]
})
foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.common.model.User',
  targetModel: 'net.nanopay.common.model.Address',
  forwardName: 'address',
  inverseName: 'resident'
});
foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.common.model.User',
  targetModel: 'net.nanopay.common.model.Account',
  forwardName: 'accounts',
  inverseName: 'owner'
});
foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.common.model.User',
  targetModel: 'net.nanopay.common.model.Phone',
  forwardName: 'phones',
  inverseName: 'owner'
});
