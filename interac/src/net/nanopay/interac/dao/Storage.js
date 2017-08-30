foam.CLASS({
  package: 'net.nanopay.interac.dao',
  name: 'Storage',

  documentation: 'Creates all Interac DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',
    'foam.dao.history.HistoryRecord'
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
