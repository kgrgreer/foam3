foam.CLASS({
  package: 'net.nanopay.common.dao',
  name: 'Client',

  documentation: 'Creates all Common DAO\'s.',

  requires: [
    'foam.dao.EasyDAO'
    'net.nanopay.common.model.Bank'
  ],

  exports: [
    'bankDAO'
  ],

  properties: [
    {
      name: 'bankDAO',
      factory: function() {
        return this.clientDAO({
          of: net.nanopay.common.model.Bank,
          url: 'bankDAO',
          testData: [
            {
              name: 'Bank of Montreal',
              financialId: '001'
            },
            {
              name: 'Scotiabank',
              financialId: '002'
            },
            {
              name: 'Royal Bank of Canada',
              financialId: '003'
            },
            {
              name: 'TD Canada',
              financialId: '004'
            },
            {
              name: 'CIBC',
              financialId: '010'
            },
            {
              name: 'Canadian Bank',
              financialId: '998'
            },
            {
              name: 'Indian Bank',
              financialId: '999'
            }
          ]
        })
      }
    },
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
