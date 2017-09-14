foam.CLASS({
  package: 'net.nanopay.admin.dao',
  name: 'Storage',

  documentation: 'Creates all Admin Portal DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',

    // TODO: Remove below + data + models + daos once admin portal is completed
    // Kept now for test data
    'net.nanopay.admin.model.Business',
    'net.nanopay.admin.model.Invoice',

    // Admin Portal
    'net.nanopay.admin.model.TopUp'
  ],

  exports: [
    'businessDAO',
    'invoiceDAO',
    'businessBusinessJunctionDAO',
    'addressDAO',
    'businessSectorDAO',
    'businessTypeDAO',


    // Admin Portal,
    'topUpDAO',
    'accountDAO',
    'bankAccountDAO'
  ],

  properties: [
    {
      name: 'businessDAO',
      factory: function() {
        return this.createDAO({
          of: this.Business,
          seqNo: true,
          testData: [
            'Connected City',
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
            'dambase',
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
            var lastNames = [
              'Martin',
              'Jacobs',
              'Yang',
              'Smith',
              'Johnson',
              'Williams',
              'Jones',
              'Brown',
              'Davis',
              'Miller',
              'Wilson',
              'Moore',
              'Taylor',
              'Anderson',
              'Thomas',
              'Jackson',
              'White',
              'Harris',
              'Martin',
              'Thompson',
              'Garcia',
              'Martinez',
              'Robinson',
              'Clark',
              'Rodrigues',
              'Lewis',
              'Lee',
              'Walker',
              'Hall',
              'Allen',
              'Young',
              'Hernandez',
              'King',
              'Wright',
              'Lopez',
              'Hill',
              'Scott',
              'Green',
              'Adams',
              'Baker',
              'Gonzalez',
              'Nelson',
              'Carter',
              'Mitchell',
              'Perez',
              'Roberts',
              'Turner',
              'Phillips',
              'Campbell',
              'Parker',
              'Evans',
              'Edwards',
              'Collins',
              'Stewart',
              'Sanchez',
              'Morris',
              'Rogers',
              'Reed',
              'Cook',
              'Morgan',
              'Bell',
              'Murphy',
              'Bailey',
              'Rivera',
              'Cooper',
              'Richardson',
              'Cox',
              'Howard',
              'Ward',
              'Torres',
              'Peterson',
              'Gray',
              'Ramirez',
              'James',
              'Watson',
              'Brooks',
              'Kelly',
              'Sanders',
              'Price',
              'Bennett',
              'Wood'
            ];
            var firstNames = [
              'Ricky',
              'Sophia',
              'Jian',
              'Jackson',
              'Emma',
              'Aiden',
              'Olivia',
              'Lucas',
              'Ava',
              'Liam',
              'Mia',
              'Noah',
              'Isabella',
              'Ethan',
              'Riley',
              'Mason',
              'Aria',
              'Caden',
              'Zoe',
              'Oliver',
              'Charlotte',
              'Elijah',
              'Lily',
              'Grayson',
              'Layla',
              'Jacob',
              'Amelia',
              'Michael',
              'Emily',
              'Benjamin',
              'Madelyn',
              'Carter',
              'Aubrey',
              'James',
              'Adalyn',
              'Jayden',
              'Madison',
              'Alexander',
              'Harper',
              'Caleb',
              'Abigail',
              'Ryan',
              'Aaliyah',
              'Luke',
              'Avery',
              'Daniel',
              'Evelyn',
              'Jack',
              'Kaylee',
              'William',
              'Ella',
              'Owen',
              'Ellie',
              'Gabriel',
              'Scarlett',
              'Matthew',
              'Arianna',
              'Connor',
              'Hailey',
              'Jayce',
              'Nora',
              'Isaac',
              'Addison',
              'Sebastian',
              'Brooklyn',
              'Henry',
              'Hannah',
              'Muhammad',
              'Mila',
              'Cameron',
              'Leah',
              'Wyatt',
              'Elizabeth',
              'Dylan',
              'Sarah',
              'Nathan',
              'Eliana',
              'Nicholas'
            ];
            // var user = foam.nanos.auth.User.create({id: 100+i, firstName: firstNames[i], lastName: lastNames[i]});
            return { id: 100+i, name: name, defaultContact: firstNames[i] + " " + lastNames[i], profileImageURL: 'images/ConnectedCityLogo.svg' }
          })
        });
      }
    },
    {
      name: 'businessBusinessJunctionDAO',
      factory: function() {
        return this.createDAO({
          of: 'net.nanopay.admin.model.BusinessBusinessJunction'
        })
      }
    },
    {
      name: 'addressDAO',
      factory: function() {
        return this.createDAO({
          of: 'foam.nanos.auth.Address',
          seqNo: true
        })
      }
    },
    {
      name: 'businessSectorDAO',
      factory: function() {
        return this.createDAO({
          of: 'net.nanopay.admin.model.BusinessSector',
          seqNo: true,
          testData: [
          {
            'name'    : 'Art dealing'
          },
          {
            'name'    : 'Audio & Video'
          },
          {
            'name'    : 'Automotive'
          },
          {
            'name'    : 'Charity & not-for-profit'
          },
          {
            'name'    : 'Consulting services'
          },
          {
            'name'    : 'Design'
          },
          {
            'name'    : 'Education & learning'
          },
          {
            'name'    : 'Entertainment - Adult'
          },
          {
            'name'    : 'Events & entertainment'
          },
          {
            'name'    : 'Financial Services'
          },
          {
            'name'    : 'Gambling, betting & online gaming'
          },
          {
            'name'    : 'Health & beauty'
          },
          {
            'name'    : 'IT services'
          },
          {
            'name'    : 'Jewellery, precious metals & stones'
          },
          {
            'name'    : 'Legal services'
          },
          {
            'name'    : 'Manufacturing'
          },
          {
            'name'    : 'Media & communication'
          },
          {
            'name'    : 'Military & semi-military goods & services'
          },
          {
            'name'    : 'Pharmaceuticals, medical & dietary supplements'
          },
          {
            'name'    : 'Public services'
          },
          {
            'name'    : 'Real estate & construction'
          },
          {
            'name'    : 'Restaurants & catering'
          },
          {
            'name'    : 'Retail & trade'
          },
          {
            'name'    : 'Sports'
          },
          {
            'name'    : 'Tobacco & alcohol'
          },
          {
            'name'    : 'Transport services'
          },
          {
            'name'    : 'Travel'
          }
          ]
        })
      }
    },
    {
      name: 'businessTypeDAO',
      factory: function() {
        return this.createDAO({
          of: 'net.nanopay.admin.model.BusinessType',
          seqNo: true,
          testData: [
            {
              name: 'Sole Proprietorship'
            },
            {
              name: 'General Partnership'
            },
            {
              name: 'Limited Partnership'
            },
            {
              name: 'Corporation'
            },
            {
              name: 'Joint Venture'
            }
          ]
        })
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
    },
    {
      name: 'topUpDAO',
      factory: function() {
        return this.createDAO({
          of: this.TopUp,
          seqNo: true
        })
        .addPropertyIndex(this.TopUp.ISSUE_DATE)
        .addPropertyIndex(this.TopUp.AMOUNT)
        .addPropertyIndex(this.TopUp.EXPECTED_DATE);
      }
    },
    {
      name: 'accountDAO',
      factory: function() {
        return this.createDAO({
          of: 'net.nanopay.model.Account',
          seqNo: true,
          testData: [
            {
              limit: net.nanopay.model.AccountLimit.create({
                dailyLimit: 700,
                weeklyLimit: 4000,
                monthlyLimit: 8000,
                yearlyLimit: 20000
              }),
              accountInfo: net.nanopay.model.BankAccountInfo.create({
                accountName: 'Tip for Anna',
                transitNumber: '1234',
                bankNumber: 'SB-004',
                accountNumber: '01234567890912',
                status: 'unverified'
              })
            },
            {
              limit: net.nanopay.model.AccountLimit.create({
                dailyLimit: 700,
                weeklyLimit: 4000,
                monthlyLimit: 8000,
                yearlyLimit: 20000,
              }),
              accountInfo: net.nanopay.model.BankAccountInfo.create({
                accountName: 'TD Saving Restaurant',
                transitNumber: '5678',
                bankNumber: 'TD-004',
                accountNumber: '01234567890123',
                status: 'unverified'
              })
            },
            {
              limit: net.nanopay.model.AccountLimit.create({
                dailyLimit: 700,
                weeklyLimit: 4000,
                monthlyLimit: 8000,
                yearlyLimit: 20000,
              }),
              accountInfo: net.nanopay.model.BankAccountInfo.create({
                accountName:'TD Chequing Restaurant',
                transitNumber: '9101',
                bankNumber: 'TD-004',
                accountNumber: '01234567894567',
                status: 'verified'
              })
            }
          ]
        })
        // .addPropertyIndex(this.Account.accountInfo.ACCOUNT_NAME)
        // .addPropertyIndex(this.Account.accountInfo.TRANSIT_NUMBER)
        // .addPropertyIndex(this.Account.accountInfo.BANK_NUMBER)
        // .addPropertyIndex(this.Account.accountInfo.ACCOUNT_NUMBER)
        // .addPropertyIndex(this.Account.accountInfo.STATUS)
      }
    },
    {
      name: 'bankAccountDAO',
      factory: function() {
        return this.createDAO({
          of: 'net.nanopay.model.BankAccountInfo',
          seqNo: true,
          testData: [
            {
              accountName: 'Tip for Anna',
              transitNumber: '1234',
              bankNumber: 'SB-004',
              accountNumber: '01234567890912',
              status: 'unverified'
            },
            {
              accountName: 'TD Saving Restaurant',
              transitNumber: '5678',
              bankNumber: 'TD-004',
              accountNumber: '01234567890123',
              status: 'unverified'
            },
            {
              accountName:'TD Chequing Restaurant',
              transitNumber: '9101',
              bankNumber: 'TD-004',
              accountNumber: '01234567894567',
              status: 'verified'
            }
          ]
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
