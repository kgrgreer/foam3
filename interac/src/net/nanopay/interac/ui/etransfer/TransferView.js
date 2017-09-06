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
    'invoice'
  ],

  properties: [
    {
      // TODO: Pull an actual user/business from a DAO
      name: 'fromUser',
      value: {
        name : 'Mark Woods',
        email : 'smitham.cristina@beahan.ca',
        tel : '+1 (907) 787-2493',
        address : '123 Avenue, Toronto, Ontario, Canada M2G 1K9',
        nationality: 'Canada',
        flag: 'images/canada.svg'
      }
    },
    {
      // TODO: Pull an actual user/business from a DAO
      name: 'toUser',
      value: {
        name : 'Mary Lindsey',
        email : 'haylee_kautzer@gmail.com',
        tel : '+91 11 2588 8257',
        address : '3/1, West Patel Nagar, New Delhi, Delhi 110008, India',
        nationality: 'India',
        flag: 'images/india.svg'
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
