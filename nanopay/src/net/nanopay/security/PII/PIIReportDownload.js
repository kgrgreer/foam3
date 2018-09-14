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
    'notificationDAO',
    'user'
  ],


  requires: [
    'foam.dao.ArraySink',
    'net.nanopay.security.PII.ViewPIIRequests',
],

  exports: [
    'as data'
  ],

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
      // TODO convert to enum with values
      // valid , pending, none
      class: 'String',
      name: 'requestsStatus',
      // value: -1
    },
    {
      class: 'Long',
      name: 'reportIssuedAgainstRequest',
      documentation: 'id of viewPIIRequest object against which a PIIreport was allowed to be downloaded'
    }
  ],


  methods: [
    // queries the viewPIIRequestsDAO and sets requestsStatus to valid, pending, or none.
    function checkPermissionStatus(instance, userID) {
      console.log('checkPermissionStatusCalled');
      vprDAO = this.viewPIIRequestsDAO;
      instance.viewPIIRequestsDAO.where(
        this.EQ(this.ViewPIIRequests.CREATED_BY, userID)
        ).select().then(
          function(parr) {
            arr = (Array(parr));
            // TODO: refactor with arr[0].instance_ and rename  variables
            // Checks if DAO is empty
            if ( Object.keys(arr[0].instance_).length === 0 && arr[0].instance_.constructor === Object ) {
                instance.requestsStatus = 'none';
                return;
            }
            for ( i = 0; i < arr[0].instance_.array.length; i++ ) {
              // Looks for pending requests in DAO
              if ( ! arr[0].instance_.array[i].instance_.viewRequestStatus ) {
                instance.requestsStatus = 'pending';
                return;
              }
              // Looks for approved request that are also not expired
              if ( arr[0].instance_.array[i].instance_.viewRequestStatus.instance_.label == 'Approved' ) {
                if ( arr[0].instance_.array[i].instance_.requestExpiresAt > new Date() ) {
                  instance.requestsStatus = 'approved';
                  instance.reportIssuedAgainstRequest = arr[0].instance_.array[0].instance_.id;
                  return;
                }
              }
            }
              // Triggered if the DAO contained only expired reqeusts
              instance.requestsStatus = 'none';
              }
            );
    },

    function addCurrentTimeToPIIRequest(instance) {
      self = instance;
      debugger;
      self.viewPIIRequestsDAO.
      where(
        self.EQ(self.ViewPIIRequests.ID, self.reportIssuedAgainstRequest)
      ).
      select().then(
        function(c) {
          console.log(c);
          debugger;
        }
      );
    },


    function initE() {
      this.SUPER();
      var self = this; 
      // TODO grab current user ID from user object instead of hard coding it.
      currentUserID = 1348;

      // set up listener on validRequests and display either a request or download button
      this.requestsStatus$.sub( function() {
        if ( self.requestsStatus == 'approved' ) {
          console.log(self.requestsStatus);
          self.addClass(self.myClass())
          .start()
            .start().addClass('light-roboto-h2').add('PII Report Download').end()
            .start().add(self.DOWNLOAD_JSON).end()
          .end();
        }
        if ( self.requestsStatus == 'none' ) {
          console.log(self.requestsStatus);
          self.addClass(self.myClass())
          .start()
            .start('div')
            .start(self.VIEW_REQUEST).addClass('update-BTN').end()
            .end()
          .end();
        }
        if ( self.requestsStatus == 'pending' ) {
          console.log(self.requestsStatus);
          self.addClass(self.myClass())
          .start()
            .start('div')
            .start('H1').add('You have already submitted a request to view your personal information.').end()
            .start('p').add('It will be reviewed shortly and you will receive an email when your information is ready to view.').end()
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
        var self = this;
        vpr = X.window.net.nanopay.security.PII.ViewPIIRequests.create();
        X.viewPIIRequestsDAO.put(vpr).then( function() {
          alert('Your request has been submitted');
          self.window.location.assign(self.window.location.origin);
          }
        );
      }
    },
    {
      name: 'downloadJSON',
      label: 'Download PII',
      code: function(X) {
        var self = this;
        // TODO: Secure this url
        // include session id and then you dont have to login - ask kirk
        var PIIUrl = self.window.location.origin + '/service/PIIWebAgent';
        this.addCurrentTimeToPIIRequest(this);
        self.window.location.assign(PIIUrl);
      }
    }
  ]

});
