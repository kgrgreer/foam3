foam.CLASS({
  name: 'User',
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'FObjectArray',
      of:    'net.nanopay.common.model.Phone',
      name:  'phones'
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
      name:  'accounts'
    },
    {
      class: 'FObjectProperty',
      of: 'Transaction',
      name:  'transactions'
    },
    {
      class: 'String',
      name: 'xeroId'
    }
  ]
})
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.common.model.Address',
  forwardName: 'address',
  inverseName: 'resident'
});
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.common.model.Account',
  forwardName: 'accounts',
  inverseName: 'owner'
});
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.common.model.Phone',
  forwardName: 'phones',
  inverseName: 'owner'
});
