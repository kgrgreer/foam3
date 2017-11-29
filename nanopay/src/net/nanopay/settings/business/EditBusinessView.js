foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'EditBusinessView',
  extends: 'foam.u2.View',

  documentation: 'Edit business view.',

  requires:[
    'foam.nanos.auth.Address',
    'net.nanopay.retail.model.Business', 
    'net.nanopay.ui.NotificationMessage'
  ],

  imports: [
    'userDAO',
    'addressDAO',
    'user',
    'stack',
    'countryDAO',
    'regionDAO',
    'businessSectorDAO',
    'businessTypeDAO'
  ],

  exports: [
    'as data'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          margin: auto;
          background-color: #edf0f5;
        }
        ^ .settingsBar {
          width: 100%;
          height: 40px;
          line-height: 40px;
          background-color: #FFFFFF;
          margin-bottom: 20px;
        }
        ^ .settingsBarContainer {
          width: 992px;
          margin: auto;
        }
        ^ .foam-u2-ActionView {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.3px;
          color: #093649;
          padding: 0;
          padding-left: 30px;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          border: none;
          background: transparent;
          outline: none;
          line-height: 40px;
        }
        ^ .foam-u2-ActionView-personalProfile {
          padding-left: 0;
        }
        ^ .foam-u2-ActionView:hover {
          background: white;
          opacity: 1;
        }
        ^ .editBusinessContainer {
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
        }
        ^registration-container{
          background: white;
          padding: 4px 25px;
          margin-bottom: 20px;
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
          cursor: pointer;
          outline: 0;
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
        .input-container-quarter{
          width: 13%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        .input-container-third{
          width: 30%;
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
        ^ .foam-u2-ActionView-saveBusiness{
          width: 100%;
          height: 40px;
          background: #59aadd;
          margin-bottom: 15px;
          outline: 0;
          border: 0;
          font-size: 14px;
          color: white;
          cursor: pointer;
          opacity: 1;
        }
        ^ .foam-u2-ActionView-saveBusiness:hover {
          background-color: #59aadd;
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
          margin-right: 15px;
        }
        ^ .net-nanopay-ui-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
      */}
    })
  ],

  properties:[
    'businessName',
    'businessNumber',
    'website',
    'address',
    'city',
    'postalCode',
    'issuingAuthority',
    'streetNumber',
    'streetName',
    {
      name: 'regionList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.regionDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
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

  methods: [
    function initE(){
      this.SUPER();
      console.log(this.user);
      this.businessName = this.user.businessName;
      this.businessTypeList = this.user.businessType;
      this.sectorList = this.user.businessSector;
      this.businessNumber = this.user.businessIdentificationNumber;
      this.website = this.user.website;
    
      this.countryList = this.user.address.countryId;
      this.regionList = this.user.address.regionId;
      this.streetNumber = this.user.address.buildingNumber;
      this.streetName = this.user.address.address;
      this.address = this.user.address.suite;
      this.city = this.user.address.city;
      this.postalCode =this.user.address.postalCode;
      this
        .addClass(this.myClass())
        .start()
          .start('div').addClass('editBusinessContainer')
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
                  .start('label').add('Website').end()
                  .start(this.WEBSITE).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Business Identification No.').end()
                  .start(this.BUSINESS_NUMBER).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Issuing Authority').end()
                  .start(this.ISSUING_AUTHORITY).end()
                .end()
                
              .end()
              .start('h3').add('Business Address').end()
              .start().addClass(this.myClass('business-registration-input'))
                .start().addClass('input-container')
                  .start('label').add('Country').end()
                  .add(this.COUNTRY_LIST)
                .end()
                .start().addClass('input-container-quarter')
                  .start('label').add('St No.').end()
                  .start(this.STREET_NUMBER).end()
                .end()
                .start().addClass('input-container-third')
                  .start('label').add('St Name').end()
                  .start(this.STREET_NAME).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Address Line').end()
                  .start(this.ADDRESS).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('City').end()
                  .start(this.CITY).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Province').end()
                  .add(this.REGION_LIST)
                .end()
                .start().addClass('input-container')
                  .start('label').add('Postal Code').end()
                  .start(this.POSTAL_CODE).end()
                .end()
              .end()
              .start(this.SAVE_BUSINESS).addClass('foam-u2-ActionView-saveBusiness').end()
            .end()
          .end()
        .end()
    }
  ],
  messages: [
    { name: 'noInformation', message: 'Please fill out all fields with errors.' }, 
    { name: 'invalidPostal', message: 'Invalid postal code entry.' },    
    
  ],
  actions: [
    {
      name: 'closeButton',
      icon: 'images/cancel-x.png',
      code: function (X) {
        X.stack.back();
      }
    },
    {
      name: 'saveBusiness',
      label: 'Save',
      code: function() {
        var self = this;
        this.postalCode = this.postalCode.toUpperCase().replace(/\s/g, '');
        
        if ( ! /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z][0-9][A-Z][0-9]$/.test(this.postalCode) )
        {
          this.add(this.NotificationMessage.create({ message: this.invalidPostal, type: 'error' }));            
          return;
        }
        
        if ( ! this.businessName || ! this.businessTypeList || ! this.sectorList || ! this.businessNumber || ! this.countryList || ! this.regionList || ! this.streetNumber || ! this.streetName || ! this.city || ! this.postalCode ) {
          this.add(this.NotificationMessage.create({ message: this.noInformation, type: 'error' }));            
          return;
        }
       

        var newAddress = this.Address.create({
          countryId: this.countryList,
          buildingNumber: this.streetNumber,
          address: this.streetName,
          regionId: this.regionList,
          suite: this.address,
          city: this.city,
          postalCode: this.postalCode
        });
        this.user.businessName = this.businessName;
        this.user.businessType = this.businessTypeList;
        this.user.businessSector = this.sectorList;
        this.user.businessIdentificationNumber = this.businessNumber;
        this.user.website = this.website;
        this.user.address = newAddress;
        this.userDAO.put(this.user).then(function(a) {
          self.stack.push({ class:'net.nanopay.settings.business.BusinessSettingsView' })
        })
      }
    }
  ]
});
