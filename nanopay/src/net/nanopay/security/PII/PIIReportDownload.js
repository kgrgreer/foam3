foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'PIIReportDownload',
  extends: 'foam.u2.View',

  documentation: 'View for downloading Personal Information Report',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'window',
    'viewPIIRequestsDAO',
    'ctrl',
    'notificationDAO'
  ],


  requires: [ 
    'foam.dao.ArraySink',
    'net.nanopay.security.PII.ViewPIIRequests',
],

  exports: [],

  css: `
  ^ {
    width: 992px;
    margin: 0 auto;
  }
  ^ .net-nanopay-ui-ActionView-downloadJSON {
    width: 135px;
    height: 50px;
    border-radius: 2px;
    background: %SECONDARYCOLOR%;
    color: white;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    cursor: pointer;
    line-height: 50px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: none;
  }
  ^ .net-nanopay-ui-ActionView-downloadJSON:hover {
    opacity: 0.9;
  }
  `,

  properties: [
    {
      class: 'Int',
      name: 'validRequests',
      value: -1
    }
  ],

  methods: [

    function checkPermissionStatus(instance, userID) {
      vprDAO = this.viewPIIRequestsDAO;
      // set valid to true if there exists a valid request for the user
      this.viewPIIRequestsDAO.where(
        this.AND(
          this.LT(new Date(), this.ViewPIIRequests.REQUEST_EXPIRES_AT),
          this.EQ(this.ViewPIIRequests.CREATED_BY, userID))
        ).select(
          this.COUNT()).then(
            function(count) {
              console.log(count.value)
              instance.validRequests = count.value;
            });
    },
    function initE() {
      this.SUPER();
      var self = this;
      
      // TODO grab current user ID from user object instead of hard coding it.
      currentUserID = 1348;


      // set up listener on validRequests and display either a request or download button
      this.validRequests$.sub( function() {
        if ( self.validRequests > 0 ) {
          self.addClass(self.myClass())
          .start()
            .start().addClass('light-roboto-h2').add('PII Report Download').end()
            .start().add(self.DOWNLOAD_JSON).end()
          .end();
        }
        if ( self.validRequests == 0 ) {
          self.addClass(self.myClass())
          .start()
            .start('div')
            .start(self.VIEW_REQUEST).addClass('update-BTN').end()
            .end()
          .end();
        }
      });
      this.checkPermissionStatus(self, currentUserID);
    }
  ],

  actions: [
    {
      name: 'viewRequest',
      label: 'Request Personal Identifiable Information Report',
      code: function(X) {
        vpr = this.net.nanopay.security.PII.ViewPIIRequests.create();
        X.viewPIIRequestsDAO.put(vpr).then( function() {
          alert('Your request has been submitted')});
      }
    },
    {
      name: 'downloadJSON',
      label: 'Download PII',
      code: function(X) {
        var self = this;
        var PIIUrl = self.window.location.origin + "/service/PIIWebAgent";
        self.window.location.assign(PIIUrl);
      }
    }
  ]

});
