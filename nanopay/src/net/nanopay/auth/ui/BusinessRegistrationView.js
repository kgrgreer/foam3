foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'BusinessRegistrationView',
  extends: 'foam.u2.View',

  documentation: 'Business registration view.',

  requires:[
    'foam.nanos.auth.Address',
  ],

  imports: [
    'addressDAO',
    'user',
    'stack',
    'countryDAO',
    'regionDAO',
    'userDAO',
    'businessSectorDAO',
    'businessTypeDAO'
  ],

  exports: [
    'as data'
  ],

  properties:[
    {
      class: 'Boolean',
      name: 'showCancel',
      value: false
    },
    {
      name: 'businessName',
      validateObj: function(businessName) {
        if(!businessName) return 'Business Name required.'
      }
    },
    {
      name: 'businessNumber',
      validateObj: function(businessNumber) {
        if (!businessNumber) return 'Business Number required.'
      }
    },
    'website',
    {
      name: 'address',
      validateObj: function(address) {
        if (!address) return 'Address required.'
      }
    },
    {
      name: 'city',
      validateObj: function(city) {
        if (!city) return 'City required.'
      }
    },
    {
      name: 'postalCode',
      view: 'net.nanopay.ui.PostalCodeFormat',
      validateObj: function(postalCode) {
        if (!postalCode) return 'Postal Code required.'
      }
    },
    {
      name: 'regionList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.regionDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      validateObj: function(regionList) {
        if (!regionList) return 'Region required.'
      }
    },
    {
      name: 'countryList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      validateObj: function(countryList) {
        if (!countryList) return 'Country required.'
      }
    },
    {
      name: 'businessTypeList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    },
    {
      name: 'sectorList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessSectorDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 490px;
          margin: auto;
        }
        ^ h2{
          opacity: 0.6;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-bottom: 50px;
          display: inline-block;
        }
        ^registration-container{
          background: white;
          padding: 15px 25px;
        }
        ^ h3{
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
        }
        ^ img{
          display: inline-block;
        }
        ^upload-button{
          display: inline-block;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background: white;
          border: solid 1px #59a5d5;
          color: #59a5d5;
          position: relative;
          top: -35;
          right: -40;
          font-size: 14px;
        }
        ^ p{
          font-size: 10px;
          color: #093649;
          font-weight: 300;
          display: inline-block;
          position: relative;
          right: 100;
        }
        ^ input{
          width: 100%;
          height: 40px;
          margin-top: 7px;
        }
        ^ label{
          font-weight: 300;
          font-size: 14px;
          color: #093649;
        }
        .input-container{
          width: 46%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        .dropdown{
          width: 200px;
          height: 200px;
          background: black;
        }
        ^ .foam-u2-tag-Select{
          height: 40px;
          width: 200px;
          background: white;
          border: 1px solid lightgrey;
          margin-top: 5px;
        }
        ^ .net-nanopay-ui-ActionView-saveBusiness{
          position: relative;
          width: 100%;
          height: 40px;
          background: none;
          background-color: #59a5d5;
          font-size: 14px;
          border: none;
          color: white;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        ^ .net-nanopay-ui-ActionView-saveBusiness:hover{
          background: none;
          background-color: #3783b3;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          cursor: pointer;
          display: inline-block;
          float: right;
          outline: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          padding-top: 15px;

        }
        ^ .net-nanopay-ui-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
      */}
    })
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('h2').add('Edit Business profile').end()
          .start(this.CLOSE_BUTTON).show(this.showCancel$).end()
          .start().addClass(this.myClass('registration-container'))
            .start('h3').add('Business information').end()
            .start().addClass(this.myClass('business-image-container'))
              .tag({class:'foam.u2.tag.Image', data: 'images/business-placeholder.png'})
              .start('button').add('Upload Image').addClass(this.myClass('upload-button')).end()
              .start('p').add('JPG, GIF, JPEG, BMP or PNG').end()
            .end()
            .start().addClass(this.myClass('business-registration-input'))
              .start().addClass('input-container')
                .start('label').add('Company Name').end()
                .start().addClass('error-label').add(this.slot(this.BUSINESS_NAME.validateObj)).end()                              
                .start(this.BUSINESS_NAME).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Company Type').end()                            
                .start(this.BUSINESS_TYPE_LIST).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Business Sector').end()
                .add(this.SECTOR_LIST)
              .end()
              .start().addClass('input-container')
                .start('label').add('Business Number').end()
                .start().addClass('error-label').add(this.slot(this.BUSINESS_NUMBER.validateObj)).end()                              
                .start(this.BUSINESS_NUMBER).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Website').end()
                .start(this.WEBSITE).end()
              .end()
            .end()
            .start('h3').add('Business Address').end()
            .start().addClass(this.myClass('business-registration-input'))
              .start().addClass('input-container')
                .start('label').add('Country').end()
                .start().addClass('error-label').add(this.slot(this.COUNTRY_LIST.validateObj)).end()                              
                .add(this.COUNTRY_LIST)
              .end()
              .start().addClass('input-container')
                .start('label').add('Address').end()
                .start().addClass('error-label').add(this.slot(this.ADDRESS.validateObj)).end()                              
                .start(this.ADDRESS).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('City').end()
                .start().addClass('error-label').add(this.slot(this.CITY.validateObj)).end()                              
                .start(this.CITY).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Province').end()
                .start().addClass('error-label').add(this.slot(this.REGION_LIST.validateObj)).end()                              
                .add(this.REGION_LIST)
              .end()
              .start().addClass('input-container')
                .start('label').add('Postal Code').end()
                .start().addClass('error-label').add(this.slot(this.POSTAL_CODE.validateObj)).end()                              
                .start(this.POSTAL_CODE).end()
              .end()
            .end()
            .add(this.SAVE_BUSINESS)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function (X) {
        X.stack.back();
      }
    },
    {
      name: 'saveBusiness',
      label: 'Save',
      isEnabled: function(businessName, address, city, postalCode, businessNumber, countryList){
        return businessName && address && city && businessNumber && postalCode && countryList;
      },
      code: function(){
        var self = this;

        var newAddress = this.Address.create({
          countryId: self.countryList,
          regionId: self.regionList,
          address: self.address,
          city: self.city,
          postalCode: self.postalCode
        });

        this.user.businessName = self.businessName;
        this.user.businessType = self.businessTypeList;
        this.user.businessSector = self.sectorList;
        this.user.businessIdentificationNumber = self.businessNumber;
        this.user.website = self.website;
        this.user.address = newAddress;
        this.user.type = 'business';

        this.userDAO.put(this.user).then(function(a){
          self.stack.push({ class:'net.nanopay.auth.ui.SignInView' });
        });
      }
    }
  ]
});
