/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.interac.dao',
  name: 'Storage',

  documentation: 'Creates all Interac DAO\'s.',

  requires: [
    'foam.dao.InterceptedDAO',
    'foam.dao.EasyDAO',
    'foam.nanos.auth.User',
    'net.nanopay.interac.model.Identification',
    'net.nanopay.interac.model.Pacs008ISOPurpose',
    'net.nanopay.interac.model.Pacs008IndiaPurpose',
    'net.nanopay.interac.model.DateAndPlaceOfBirth',
    'net.nanopay.model.Account'
  ],

  exports: [
    'businessDAO',
    'identificationDAO',
    'pacs008ISOPurposeDAO',
    'pacs008IndiaPurposeDAO',
    'dateAndPlaceOfBirthDAO',
    'payeeDAO'
  ],

  properties: [
    {
      name: 'pacs008ISOPurposeDAO',
      factory: function() {
        return this.createDAO({
          of: this.Pacs008ISOPurpose,
          seqNo: true,
          testData: [
            {
              type: 'Organization',
              code: 'AGRT',
              classification: 'Commercial',
              name: 'Agricultural Transfer',
              definition: 'Transaction is related to the agricultural domain.'
            },
            {
              type: 'Organization',
              code: 'AREN',
              classification: 'Commercial',
              name: 'Accounts Receivable Entry',
              definition: 'Transaction is related to a payment associated with an Account Receivable Entry.'
            },
            {
              type: 'Organization',
              code: 'BEXP',
              classification: 'Commercial',
              name: 'Business Expenses',
              definition: 'Transaction is related to a payment of business expenses.'
            },
            {
              type: 'Organization',
              code: 'BOCE',
              classification: 'Commercial',
              name: 'Back Office Conversion Entry',
              definition: 'Transaction is related to a payment associated with a Back Office Conversion Entry.'
            },
            {
              type: 'Organization',
              code: 'COMC',
              classification: 'Commercial',
              name: 'Commercial Payment',
              definition: 'Transaction is related to a payment of commercial credit or debit. (formerly Commercial Credit).'
            },
            {
              type: 'Organization',
              code: 'CPYR',
              classification: 'Commercial',
              name: 'Copyright',
              definition: 'Transaction is payment of copyright.'
            },
            {
              type: 'Organization',
              code: 'GDDS',
              classification: 'Commercial',
              name: 'Purchase Sale Of Goods',
              definition: 'Transaction is related to purchase and sale of goods.'
            },
            {
              type: 'Organization',
              code: 'GDSV',
              classification: 'Commercial',
              name: 'Purchase Sale Of Goods And Services',
              definition: 'Transaction is related to purchase and sale of goods and services.'
            },
            {
              type: 'Organization',
              code: 'GSCB',
              classification: 'Commercial',
              name: 'Purchase Sale Of Goods And Services With Cash Back',
              definition: 'Transaction is related to purchase and sale of goods and services.'
            },
            {
              type: 'Organization',
              code: 'GSCB',
              classification: 'Commercial',
              name: 'Purchase Sale Of Goods And Services With Cash Back',
              definition: 'Transaction is related to purchase and sale of goods and services with cash back.'
            },
            {
              type: 'Organization',
              code: 'LICF',
              classification: 'Commercial',
              name: 'Licence Fee',
              definition: 'Transaction is payment of a license fee.'
            },
            {
              type: 'Organization',
              code: 'POPE',
              classification: 'Commercial',
              name: 'Point Of Purchase Entry',
              definition: 'Transaction is related to a payment associated with a Point of Purchase Entry.'
            },
            {
              type: 'Organization',
              code: 'ROYA',
              classification: 'Commercial',
              name: 'Royalties',
              definition: 'Transaction is the payment of royalties.'
            },
            {
              type: 'Organization',
              code: 'SCVE',
              classification: 'Commercial',
              name: 'Purchase Sale Of Services',
              definition: 'Transaction is related to purchase and sale of services.'
            },
            {
              type: 'Organization',
              code: 'SUBS',
              classification: 'Commercial',
              name: 'Subscription',
              definition: 'Transaction is related to a payment of information or entertainment services either in printed or electronic form.'
            },
            {
              type: 'Organization',
              code: 'SUPP',
              classification: 'Commercial',
              name: 'Supplier Payment',
              definition: 'Transaction is related to a payment to a supplier.'
            },
            {
              type: 'Organization',
              code: 'TRAD',
              classification: 'Commercial',
              name: 'Trade Services',
              definition: 'Transaction is related to a trade services operation.'
            },
            {
              type: 'Organization',
              code: 'IVPT',
              classification: 'General',
              name: 'Invoice Payment',
              definition: 'Transaction is the payment for invoices.'
            },
            {
              type: 'Organization',
              code: 'ADCS',
              classification: 'Salary & Benefits',
              name: 'Advisory Donation Copyright Services',
              definition: 'Payments for donation, sponsorship, advisory, intellectual and other copyright services.'
            },
            {
              type: 'Organization',
              code: 'AEMP',
              classification: 'Salary & Benefits',
              name: 'Active Employment Policy',
              definition: 'Payment concerning active employment policy.'
            },
            {
              type: 'Organization',
              code: 'ALLW',
              classification: 'Salary & Benefits',
              name: 'Allowance',
              definition: 'Transaction is the payment of allowances.'
            },
            {
              type: 'Individual',
              code: 'CHAR',
              classification: 'Consumer',
              name: 'Charity Payment',
              definition: 'Transaction is a payment for charity reasons.'
            },
            {
              type: 'Individual',
              code: 'CLPR',
              classification: 'Finance',
              name: 'Car Loan Principle Repayment',
              definition: 'Transaction is a payment of car loan principal payment.'
            },
            {
              type: 'Individual',
              code: 'DBTC',
              classification: 'Finance',
              name: 'Debit Collection Payment',
              definition: 'Collection of funds initiated via a debit transfer.'
            },
            {
              type: 'Individual',
              code: 'GOVI',
              classification: 'Finance',
              name: 'Government Insurance',
              definition: 'Transaction is related to a payment of government insurance.'
            },
            {
              type: 'Individual',
              code: 'HLRP',
              classification: 'Finance',
              name: 'Housing Loan Repayment',
              definition: 'Transaction is related to a payment of housing loan.'
            },
            {
              type: 'Individual',
              code: 'INPC',
              classification: 'Finance',
              name: 'Insurance Premium Car',
              definition: 'Transaction is a payment of car insurance premium.'
            },
            {
              type: 'Individual',
              code: 'INSU',
              classification: 'Finance',
              name: 'Insurance Premium',
              definition: 'Transaction is payment of an insurance premium.'
            },
            {
              type: 'Individual',
              code: 'INTE',
              classification: 'Finance',
              name: 'Interest',
              definition: 'Transaction is payment of interest.'
            },
            {
              type: 'Individual',
              code: 'LBRI',
              classification: 'Finance',
              name: 'Labor Insurance',
              definition: 'Transaction is a payment of labor insurance.'
            },
            {
              type: 'Individual',
              code: 'LIFI',
              classification: 'Finance',
              name: 'Life Insurance',
              definition: 'Transaction is a payment of life insurance.'
            },
            {
              type: 'Individual',
              code: 'LOAN',
              classification: 'Finance',
              name: 'Loan',
              definition: 'Transaction is related to transfer of loan to borrower.'
            },
            {
              type: 'Individual',
              code: 'LOAR',
              classification: 'Finance',
              name: 'Loan Repayment',
              definition: 'Transaction is related to repayment of loan to lender.'
            },
            {
              type: 'Individual',
              code: 'PENO',
              classification: 'Finance',
              name: 'Payment Based On Enforcement Order',
              definition: 'Payment based on enforcement orders except those arising from judicial alimony decrees.'
            },
            {
              type: 'Individual',
              code: 'PPTI',
              classification: 'Finance',
              name: 'Property Insurance',
              definition: 'Transaction is a payment of property insurance.'
            },
            {
              type: 'Individual',
              code: 'RELG',
              classification: 'Finance',
              name: 'Rental Lease General',
              definition: 'Transaction is for general rental/lease.'
            },
            {
              type: 'Individual',
              code: 'RINP',
              classification: 'Finance',
              name: 'Recurring Installment Payment',
              definition: 'Transaction is related to a payment of a recurring installment made at regular intervals.'
            },
            {
              type: 'Individual',
              code: 'OTHR',
              classification: 'General',
              name: 'Other',
              definition: 'Other payment purpose.'
            },
            {
              type: 'Individual',
              code: 'RENT',
              classification: 'General',
              name: 'Rent',
              definition: 'Transaction is the payment of rent.'
            },
            {
              type: 'Individual',
              code: 'ALMY',
              classification: 'Salary & Benefits',
              name: 'Alimony Payment',
              definition: 'Transaction is the payment of alimony.'
            }
          ]
        })
        .addPropertyIndex(this.Pacs008ISOPurpose.TYPE)
        .addPropertyIndex(this.Pacs008ISOPurpose.CODE)
        .addPropertyIndex(this.Pacs008ISOPurpose.CLASSIFICATION)
        .addPropertyIndex(this.Pacs008ISOPurpose.NAME)
        .addPropertyIndex(this.Pacs008ISOPurpose.DEFINITION)
      }
    },
    {
      name: 'pacs008IndiaPurposeDAO',
      factory: function() {
        return this.createDAO({
          of: this.Pacs008IndiaPurpose,
          seqNo: true,
          testData: [
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0801',
              description: 'Hardware consultancy/implementation'
            },
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0802',
              description: 'Software consultancy/implementation (other than those covered in SOFTEX form)'
            },
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0803',
              description: 'Data base, data processing charges'
            },
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0804',
              description: 'Repair and maintenance of computer and software'
            },
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0805',
              description: 'News agency services'
            },
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0806',
              description: 'Other information services - Subscription to newspapers, periodicals, etc.'
            },
            {
              type: 'Organization',
              grNo: 8,
              groupName: 'Computer & Information Services',
              code: 'P0807',
              description: 'Off site Software Exports'
            },
            {
              type: 'Individual',
              grNo: 13,
              groupName: 'Transfers',
              code: 'P1301',
              description: 'Inward remittance from Indian non-residents towards family maintenance and savings'
            },
            {
              type: 'Individual',
              grNo: 13,
              groupName: 'Transfers',
              code: 'P1302',
              description: 'Personal gifts and donations'
            },
            {
              type: 'Individual',
              grNo: 13,
              groupName: 'Transfers',
              code: 'P1303',
              description: 'Donations to religious and charitable institutions in India'
            },
            {
              type: 'Individual',
              grNo: 13,
              groupName: 'Transfers',
              code: 'P1304',
              description: 'Grants and donations to governments and charitable institutions established by the governments'
            }
          ]
        });
      }
    },
    {
      name: 'identificationDAO',
      factory: function () {
        return this.createDAO({
          of: this.Identification,
          seqNo: true,
          testData: [
            {
              identifier: 'A0179129',
              owner: 1,
              code: 'CCPT',
              issuer: 'Govt of Canada'
            },
            {
              identifier: '548556788923',
              owner: 2,
              code: 'NDIN',
              issuer: 'Govt of India'
            }
          ]
        })
      }
    },
    {
      name: 'dateAndPlaceOfBirthDAO',
      factory: function () {
        return this.createDAO({
          of: this.DateAndPlaceOfBirth,
          seqNo: true,
          testData: [
            {
              user: 1,
              birthday: new Date('1982-07-07T23:12:00.000Z'),
              birthplace: {
                city: 'Toronto',
                regionId: 'ON',
                countryId: 'CA'
              }
            },
            {
              user: 2,
              birthday: new Date('1985-08-02T23:12:00.000Z'),
              birthplace: {
                city: 'Pune',
                regionId: 'MH',
                countryId: 'IN'
              }
            }
          ]
        })
      }
    },
    {
      name: 'payeeDAO',
      factory: function () {
        return this.createDAO({
          of: this.User,
          seqNo: true,
          testData: [
            {
              "id":1,
              "spid":"",
              "firstName":"Simon",
              "middleName":"",
              "lastName":"Keogh",
              "organization":"nanopay Corporation",
              "department":"",
              "email":"simon@gmail.com",
              "phone":"+1-4169001111",
              "mobile":"","type":"",
              "birthday":"1982-07-07T21:12:00.0Z",
              "address":{
                "class":"foam.nanos.auth.Address",
                "type":"",
                "verified":false,
                "deleted":false,
                "address":"666 GitHub Boulevard",
                "suite":"300",
                "city":"Toronto",
                "postalCode":"M6G2H3",
                "countryId":"CA",
                "regionId":"ON",
                "encrypted":false
              },
              "accounts":[],
              "language":"en",
              "timeZone":"",
              "password":"22b70d9b9c98bdfee23e47c874f4a92257268449572e7edfcaa7f0eee569b7de35e8bea44e5b93e3e1dce9cf96425ac3c7fc88b6cfa53a6fa9064b99244192ce:5932aeb0bda8cf763dc94f02459799250a619b6d",
              "previousPassword":"",
              "note":""
            },
            {
              "id":2,
              "spid":"",
              "firstName":"Varun",
              "middleName":"",
              "lastName":"Dhawan",
              "organization":"360 Design",
              "department":"",
              "email":"varun@gmail.com",
              "phone":"+91-9095253276",
              "mobile":"",
              "type":"",
              "birthday":"1985-08-02T21:12:00.0Z",
              "address":{
                "class":"foam.nanos.auth.Address",
                "type":"",
                "verified":false,
                "deleted":false,
                "address":"Dance Colony, Apt 2300, Near XYZ Plaza, Mumbai400051",
                "suite":"",
                "city":"",
                "postalCode":"",
                "countryId":"IN",
                "regionId":"MH",
                "encrypted":false
              },
              "accounts":[],
              "language":"en",
              "timeZone":"",
              "password":"e4553e36f473d494ef7b46beed5fe6d63fb48afb102a33394d7fedc76cd2cfb014bf6970d31d005884a44850df0b4c980879ce758c3547309b4648a926277641:a4b036f531f7e7dc438a3f358ad91e4f7a81f80f",
              "previousPassword":"",
              "note":""
            }
          ]
        })
      }
    },
    {
      name: 'businessDAO',
      factory: function() {
        return this.createDAO({
          of: this.Business,
          seqNo: true,
          testData: [
            '360 Design Inc.',
            'ABC Engineering',
            'Ali Designs',
            'Betasoloin',
            'Betatech',
            'Bioholding',
            'Bioplex',
            'Blackzim',
            'Cancity',
            'Codehow',
            'Condax',
            'Conecom',
            'Dalttechnology',
            'Dambase',
            'Domzoom',
            'Doncon',
            'Donquadtech',
            'Dontechi',
            'Donware',
            'Fasehatice',
            'Faxquote',
            'Finhigh',
            'Finjob',
            'Funholding',
            'Ganjaflex',
            'Gogozoom',
            'Golddex',
            'Goodsilron',
            'Green-Plus',
            'Groovestreet',
            'Hatfan',
            'Hottechi',
            'Inity',
            'Isdom',
            'Iselectrics',
            'J-Texon',
            'Kan-code',
            'Kinnamplus',
            'Konex',
            'Konmatfix',
            'Labdrill',
            'Lexiqvolax',
            'Mach Engineering',
            'Mathtouch',
            'Nam-zim',
            'Newex',
            'Ontomedia',
            'Openlane',
            'Opentech',
            'Plexzap',
            'Plusstrip',
            'Plussunin',
            'Rangreen',
            'Rantouch',
            'Ron-tech',
            'Rundofase',
            'Scotfind',
            'Scottech',
            'Silis',
            'Singletechno',
            'Sonron',
            'Stanredtax',
            'Statholdings',
            'Streethex',
            'Sumace',
            'Sunnamplex',
            'Toughzap',
            'Treequote',
            'Warephase',
            'Xx-holding',
            'Xx-zobam',
            'Y-corporation',
            'year-job',
            'Yearin',
            'Zathunicon',
            'Zencorporation',
            'Zoomit',
            'Zotware',
            'Zumgoity'
          ].map(function (name, i) {
            // var user = foam.nanos.auth.User.create({id: 100+i, firstName: firstNames[i], lastName: lastNames[i]});
            return { id: i+2, name: name, profileImageURL: 'images/business-placeholder.png' }
          })
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
