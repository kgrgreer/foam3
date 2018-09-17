foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'PIIReportDownload',
  extends: 'foam.u2.View',

  documentation: 'View for downloading Personal Information Report',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'ctrl',
    'notificationDAO',
    'user',
    'viewPIIRequestsDAO',
    'window'
  ],


  requires: [
    'foam.dao.ArraySink',
    'net.nanopay.security.PII.ViewPIIRequests'
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
    }
  ],


  methods: [
    // queries the viewPIIRequestsDAO and sets requestsStatus to valid, pending, or none.
    function checkPermissionStatus(instance, userID) {
      vprDAO = this.viewPIIRequestsDAO;
      instance.viewPIIRequestsDAO.where(
        this.EQ(this.ViewPIIRequests.CREATED_BY, userID)
        ).select().then(
          function(result) {
            arr = (Array(result))[0].instance_;
            // returns if DAO is empty
            if ( Object.keys(arr).length === 0 && arr.constructor === Object ) {
                instance.requestsStatus = 'none';
                return;
            }
            for ( i = 0; i < arr.array.length; i++ ) {
              // Looks for pending requests in DAO
              if ( ! arr.array[i].instance_.viewRequestStatus ) {
                instance.requestsStatus = 'pending';
                return;
              }
              // Looks for approved request that are also not expired
              if ( arr.array[i].instance_.viewRequestStatus.instance_.label == 'Approved' ) {
                if ( arr.array[i].instance_.requestExpiresAt > new Date() ) {
                  instance.requestsStatus = 'approved';
                  return;
                }
              }
            }
              // Triggered if the DAO contained only expired reqeusts
              instance.requestsStatus = 'none';
              }
            );
    },

    function initE() {
      this.SUPER();
      var self = this;
      currentUserID = this.user.id;

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
        var self = X.window;
        var sessionId = localStorage['defaultSession'];
        var url = self.window.location.origin + '/service/PIIWebAgent';
        if ( sessionId ) {
          url += '?sessionId=' + sessionId;
        }
        self.window.location.assign(url);
      }
    }
  ]

});
