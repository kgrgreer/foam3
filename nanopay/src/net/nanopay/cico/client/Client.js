foam.CLASS({
  package: 'net.nanopay.cico.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'CICO Service Client.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox'
  ],

  exports: [
    'cicoLogDAO'
  ],

  properties: [
    {
      name: 'cicoLogDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.User,
          serviceName: 'cicoLogDAO'
        })
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
