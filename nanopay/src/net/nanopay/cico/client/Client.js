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
  ],

  properties: [
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
