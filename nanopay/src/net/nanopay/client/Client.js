foam.CLASS({
  package: 'net.nanopay.client',
  name: 'Client',

  documentation: 'Creates all DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice',
    'net.nanopay.model.Account',
    'net.nanopay.model.Bank',
    'net.nanopay.model.BankAccountInfo',
    'net.nanopay.model.BusinessSector',
    'net.nanopay.model.BusinessType'
  ],

  exports: [
    'bankDAO',
    'bankAccountDAO',
    'businessSectorDAO',
    'businessTypeDAO',
    'recurringInvoiceDAO',
    'invoiceDAO'
  ],

  properties: [
    {
      name: 'bankDAO',
      factory: function () {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.Bank,
          serviceName: 'bankDAO',
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
              branchId: '10002',
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
      name: 'bankAccountDAO',
      factory: function () {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.Account,
          serviceName: 'bankAccountDAO',
          testData: [
            {
              id: 1,
              accountInfo: this.BankAccountInfo.create({
                accountNumber: '490932681376',
                currencyCode: 'CAD',
                bankAccount: 4
              })
            },
            {
              id: 2,
              accountInfo: this.BankAccountInfo.create({
                accountNumber: '923000000008465748932',
                currencyCode: 'INR',
                bankAccount: 8
              })
            }
          ]
        })
      }
    },
    {
      name: 'businessSectorDAO',
      factory: function () {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          of: this.BusinessSector,
          cache: true,
          seqNo: true,
          testData: [
            { 'name': 'Art dealing' },
            { 'name': 'Audio & Video' },
            { 'name': 'Automotive' },
            { 'name': 'Charity & not-for-profit' },
            { 'name': 'Consulting services' },
            { 'name': 'Design' },
            { 'name': 'Education & learning' },
            { 'name': 'Entertainment - Adult' },
            { 'name': 'Events & entertainment' },
            { 'name': 'Financial Services' },
            { 'name': 'Gambling, betting & online gaming' },
            { 'name': 'Health & beauty' },
            { 'name': 'IT services' },
            { 'name': 'Jewellery, precious metals & stones' },
            { 'name': 'Legal services' },
            { 'name': 'Manufacturing' },
            { 'name': 'Media & communication' },
            { 'name': 'Military & semi-military goods & services' },
            { 'name': 'Pharmaceuticals, medical & dietary supplements' },
            { 'name': 'Public services' },
            { 'name': 'Real estate & construction' },
            { 'name': 'Restaurants & catering' },
            { 'name': 'Retail & trade' },
            { 'name': 'Sports' },
            { 'name': 'Tobacco & alcohol' },
            { 'name': 'Transport services' },
            { 'name': 'Travel' }
          ]
        })
      }
    },
    {
      name: 'businessTypeDAO',
      factory: function () {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          of: this.BusinessType,
          cache: true,
          seqNo: true,
          testData: [
            { name: 'Sole Proprietorship' },
            { name: 'General Partnership' },
            { name: 'Limited Partnership' },
            { name: 'Corporation' },
            { name: 'Joint Venture' },
          ]
        })
      }
    },
    {
      name: 'invoiceDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.Invoice,
          serviceName: 'invoiceDAO',
        })
        .addPropertyIndex(this.Invoice.STATUS)
        .addPropertyIndex(this.Invoice.PAYEE_NAME)
        .addPropertyIndex(this.Invoice.PAYER_NAME)
        .addPropertyIndex(this.Invoice.PAYEE_ID)
        .addPropertyIndex(this.Invoice.PAYER_ID);
      }
    },
    {
      name: 'recurringInvoiceDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.RecurringInvoice,
          serviceName: 'recurringInvoiceDAO',
          seqNo: true
        })
      }
    }
  ]
});