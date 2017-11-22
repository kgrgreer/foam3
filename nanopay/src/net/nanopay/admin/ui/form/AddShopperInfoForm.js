foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input shopper information',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in shopper\'s info and create a password' },
    { name: 'Title', message: 'Personal Information' },
    { name: 'UploadImage', message: 'Upload Image' },
    { name: 'FirstName', message: 'First Name' },
    { name: 'LastName', message: 'Last Name' },
  ]
})