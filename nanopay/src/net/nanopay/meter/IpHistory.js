foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'IpHistory',

  documentation: `User IP history model`,

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  imports: [
    'userDAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      name: 'ipAddress',
      label: 'IP Address',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'description',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.meter.IpHistory',
  forwardName: 'ipHistories',
  inverseName: 'user',
  sourceProperty: {
    hidden: true,
    transient: true
  },
  targetProperty: {
    visibility: 'RO',
    tableCellFormatter: function(value, obj) {
      obj.userDAO.find(value).then(function(user) {
        this.add(user.email);
      }.bind(this));
    }
  }
});
