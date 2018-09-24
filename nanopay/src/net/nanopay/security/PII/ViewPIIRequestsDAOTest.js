foam.CLASS({
  package: 'net.nanopay.security.pii',
  name: 'ViewPIIRequestsDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.mlang.sink.Count',
    'foam.mlang.MLang',
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
  ViewPIIRequestsDAO_EnforcesOnlyValidOneRequestPerUser(x, vprDAO);
  ViewPIIRequestsDAO_ApprovedValidRequestIsFrozen(x, vprDAO);
  ViewPIIRequestsDAO_DownloadTimesAreLogged(x, vprDAO);
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
        },
        {
          name: 'vprDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
  // Create a request and put to the DAO, get a count of objects in the DAO
  ViewPIIRequests piiRequest = new ViewPIIRequests();
  piiRequest.setCreatedBy(INPUT.getId());
  vprDAO.put(piiRequest);
  Count count = (Count) vprDAO.select(new Count());
  // Create another request and put to the DAO, get an updated count
  ViewPIIRequests newPiiRequest = new ViewPIIRequests();
  newPiiRequest.setCreatedBy(INPUT.getId());
  vprDAO.put(newPiiRequest);
  Count updatedCount = (Count) vprDAO.select(new Count());
  // Assert that the second request was not actually put to the DAO
  test( updatedCount.equals(count), "User cannot have more than one active request in the system at a time" );
      `
    }
  ]
});
