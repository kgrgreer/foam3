foam.CLASS({
  package: 'net.nanopay.ingenico.dao',
  name: 'Storage',

  documentation: 'Creates all DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',
    'net.nanopay.ingenico.model.Transaction'
  ],

  exports: [
    'transactionDAO'
  ],

  properties: [
    {
      name: 'transactionDAO',
      factory: function () {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
          testData: [
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00'
            },
            {
              name: 'Robert Woods',
              image: 'images/ic-placeholder.png',
              datetime: '11 Dec 2016',
              amount: '$5.00',
              pending: true
            }
          ]
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