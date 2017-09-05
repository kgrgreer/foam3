foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Main Client for connecting to NANOS server.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.interac.model.Payee'
  ],

  exports: [
    'payeeDAO'
  ],

  properties: [
    {
      name: 'payeeDAO',
      factory: function() {
        return this.createDAO({
          of: this.Payee,
          testData: []
        });
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
