foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'ViewPIIRequestsDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.EQ',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        DAO vprDAO = (DAO) x.get("ViewPIIRequestsDAO");
        x = x.put("viewPIIRequestDAO", vprDAO);

        // run tests
        ViewPIIRequestsDAO_DAOIsAuthenticated(x);
        ViewPIIRequestsDAO_ApprovedValidRequestIsFrozenExpectDownloadedAt(x);
        ViewPIIRequestsDAO_DownloadTimesAreLogged(x);
        ViewPIIRequestsDAO_EnforcesOnlyValidOneRequestPerUser(x);
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
      name: 'ViewPIIRequestsDAO_ApprovedValidRequestIsFrozenExpectDownloadedAt',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
      // create a new request and put to dao

      // approve that request

      // try to change the user and approved by and save, assert that they are unchanged
      
      // try to change the times and save, assert that they haven't changed
      
      
      // try to change the status and test that it hasn't changed





  test( true , "Hello from the viewPIIReqeustsDAO tests!!" );
  `
    },
    {
      name: 'ViewPIIRequestsDAO_DownloadTimesAreLogged',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
  // run a download and see if the time is logged in the DownloadedAt prop

`
    },
    {
      name: 'ViewPIIRequestsDAO_DownloadTimesAreLogged',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
  // run a download and see if the time is logged in the DownloadedAt prop

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
