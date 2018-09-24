foam.CLASS({
  package: 'net.nanopay.security.pii',
  name: 'ViewPIIRequestsDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.EQ',
    'java.util.Date',
    'java.util.Calendar',
    'java.util.ArrayList',
    'net.nanopay.security.pii.PIIRequestStatus',
    'net.nanopay.security.pii.PIIReportGenerator'

  ],

  constants: [
    {
      type: 'User',
      name: 'INPUT',
      documentation: 'Original input',
      value: `
        new User.Builder(EmptyX.instance())
          .setId(1100)
          .setFirstName("Rumple")
          .setLastName("Stiltskin")
          .setEmail("rumple@stiltskin.au")
          .build()
      `
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  // run tests
  // ViewPIIRequestsDAO_DAOIsAuthenticated(x);
  ViewPIIRequestsDAO_ApprovedValidRequestIsFrozen(x, vprDAO);
  ViewPIIRequestsDAO_DownloadTimesAreLogged(x, vprDAO);
  // ViewPIIRequestsDAO_EnforcesOnlyValidOneRequestPerUser(x);
      `
    },
    {
      name: 'ViewPIIRequestsDAO_DAOIsAuthenticated',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
  test( true , "Hello from the viewPIIReqeustsDAO tests!!" );
  `
    },
    {
      name: 'ViewPIIRequestsDAO_ApprovedValidRequestIsFrozen',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'vprDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
  // Create new request, set it to approved and put to DAO
  ViewPIIRequests piiRequest = new ViewPIIRequests();
  piiRequest.setId(100);
  piiRequest.setViewRequestStatus(PIIRequestStatus.APPROVED);
  vprDAO.put(piiRequest);
  // Find object from DAO
  FObject daoRequestObject = vprDAO.find(100);
  // Modify the object and put it to DAO again
  piiRequest.setViewRequestStatus(PIIRequestStatus.PENDING);
  piiRequest.setCreated(new Date());
  piiRequest.setRequestExpiresAt(new Date());
  vprDAO.put(piiRequest);
  // Find the object again
  FObject modifiedDaoRequestObject = vprDAO.find(100);
  // Confirm that the dao Object was not modified    
  test( daoRequestObject.equals(modifiedDaoRequestObject) , "updating an approved request doesnt work" );
  `
    },
    {
      name: 'ViewPIIRequestsDAO_DownloadTimesAreLogged',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'vprDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
  // Create new request, set it to approved and put to DAO
  ViewPIIRequests piiRequest = new ViewPIIRequests();
  piiRequest.setId(100);
  piiRequest.setViewRequestStatus(PIIRequestStatus.APPROVED);
  vprDAO.put(piiRequest);
  // Find object from DAO
  FObject daoRequestObject = vprDAO.find(100);
  ArrayList downloadedAt = (ArrayList) daoRequestObject.getProperty("downloadedAt");
  // Simulate a download and get the object again
  PIIReportGenerator prg = new PIIReportGenerator();
  prg.addTimeToPIIRequest(x);
  FObject modifiedDaoRequestObject = vprDAO.find(100);
  ArrayList modifiedDownloadedAt = (ArrayList) modifiedDaoRequestObject.getProperty("downloadedAt");
  // Test that the downloadedAt array is larger than before
  test( downloadedAt.size() < modifiedDownloadedAt.size() , "downloadedAt is modified when a download is triggered" );
      `
    },
    {
      name: 'ViewPIIRequestsDAO_EnforcesOnlyValidOneRequestPerUser',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
      // put a pending request, then try to put another and see if it goes through

      // put a request, approve it, put another one, see if it goes through

      // chceck if a request goes through if there is an expired request.

`
    }
  ]
});
