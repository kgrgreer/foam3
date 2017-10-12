foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferView',
  extends: 'foam.u2.Controller',

  documentation: 'The default view that would be used for a view in the substack in the WizardView.',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext',
    'countdownView',
    'invoice',
    'invoiceMode',
    'user'
  ],

  properties: [
    {
      // TODO: Pull an actual user/business from a DAO
      name: 'fromUser',
      value: {
        "class":"foam.nanos.auth.User",
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
        "profilePicture":"",
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
        "accounts":[
          {
            "id":1,
            "accountInfo":{
              "class":"net.nanopay.model.BankAccount",
              "id":"",
              "accountName":"",
              "transitNumber":"",
              "accountNumber":"490932681376",
              "status":"",
              "xeroId":"",
              "currencyCode":"CAD"
            }
          }
        ],
        "language":"en",
        "timeZone":"",
        "password":"22b70d9b9c98bdfee23e47c874f4a92257268449572e7edfcaa7f0eee569b7de35e8bea44e5b93e3e1dce9cf96425ac3c7fc88b6cfa53a6fa9064b99244192ce:5932aeb0bda8cf763dc94f02459799250a619b6d",
        "previousPassword":"",
        "note":""
      }
    },
    {
      // TODO: Pull an actual user/business from a DAO
      name: 'toUser',
      value: {
        "class":"foam.nanos.auth.User",
        "id":2,
        "spid":"",
        "firstName":"Varun",
        "middleName":"",
        "lastName":"Dhawan",
        "organization":"",
        "department":"",
        "email":"varun@gmail.com",
        "phone":"+91-9095253276",
        "mobile":"",
        "type":"",
        "birthday":"1985-08-02T21:12:00.0Z",
        "profilePicture":"",
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
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
});
