foam.CLASS({
  package: 'net.nanopay.common.dao',
  name: 'Storage',

  documentation: 'Creates all common DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.b2b.model.Invoice',
    'net.nanopay.common.model.Bank',
    'net.nanopay.transactionservice.model.Transaction'
  ],

  exports: [
    'bankDAO',
    'invoiceDAO',
    'transactionDAO'
  ],

  properties: [
    {
      name: 'bankDAO',
      factory: function() {
        return this.clientDAO({
          of: this.Bank,
          url: 'bankDAO',
          seqNo: true,
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
              financialId: '004',
              branchId: '10202',
              memberIdentification: '004',
              clearingSystemIdentification: 'CACPA',
              address: {
                buildingNumber: 55,
                address: 'King St W',
                city: 'Toronto',
                postalCode: 'M5K1A2',
                regionId: 'ON',
                countryId: 'CA'
              }
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
            },
            {
              name: 'State Bank of India',
              financialId: 'SBIN0071222',
              memberIdentification: 'SBIN0071222',
              clearingSystemIdentification: 'INFSC',
              address: {
                address: 'THECAPITAL,201,2NDFLOOR,BWING,BANDRAKURLACOMPLEX,BANDRAEAST,MUMBAI-400051',
                city: 'Mumbai',
                regionId: 'MH',
                countryId: 'IN'
              }
            },
            {
              name: 'ICICI Bank Canada',
              financialId: '340',
              memberIdentification: '340',
              clearingSystemIdentification: 'CACPA',
              address: {
                buildingNumber: 130,
                address: 'King St W',
                suite: '2130',
                city: 'Toronto',
                postalCode: 'M5X1B1',
                regionId: 'ON',
                countryId: 'CA'
              }
            },
            {
              name: 'ICICI Bank Limited',
              financialId: 'ICIC0006438',
              memberIdentification: 'ICIC0006438',
              clearingSystemIdentification: 'INFSC',
              address: {
                address: 'PANCHAVATI CO-OP HOUSING SOCIETY,OPP. POLICE HEAD QUARTER,MAROL-MORSHI ROAD, ANDHERI-EAST MUMBAI-400059',
                city: 'Mumbai',
                regionId: 'MH',
                countryId: 'IN'
              }
            }
          ]
        })
      }
    },
    {
      name: 'transactionDAO',
      factory: function() {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
          testData: [
              {
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payerId: 1, payeeId: 2, amount: 2300.00, rate: 52.51, fees: 20.00
              },
              {
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payerId: 1, payeeId: 2, amount: 3200.00, rate: 52.51, fees: 20.00
              }
          ]
        })
        .addPropertyIndex(this.Transaction.REFERENCE_NUMBER)
        .addPropertyIndex(this.Transaction.DATE)
        .addPropertyIndex(this.Transaction.PAYEE_ID)
        .addPropertyIndex(this.Transaction.AMOUNT)
        .addPropertyIndex(this.Transaction.RATE)
        .addPropertyIndex(this.Transaction.FEES)
      }
    },
    {
      name: 'invoiceDAO',
      factory: function() {
        /*this.DecoratedDAO.create({
          decorator: this.InvoiceDecorator.create(),
          delegate: */
        return this.createDAO({
            of: this.Invoice,
            seqNo: true
          })
          .addPropertyIndex(this.Invoice.STATUS)
          .addPropertyIndex(this.Invoice.TO_BUSINESS_NAME)
          .addPropertyIndex(this.Invoice.FROM_BUSINESS_NAME)
          .addPropertyIndex(this.Invoice.TO_BUSINESS_ID)
          .addPropertyIndex(this.Invoice.FROM_BUSINESS_ID);
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    },

    function clientDAO(config) {
      var dao = this.EasyDAO.create({
        daoType: 'CLIENT',
        of: config.of,
        seqNo: config.seqNo,
        serviceName: config.url,
        testData: config.testData
      });

      return dao;
    }
  ]
});