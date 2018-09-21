foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'PreventDuplicatePIIRequestsDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'viewPIIRequestDAO',
    'user'
  ],

  documentation: ` `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'java.util.Date',
    'net.nanopay.security.PII.ViewPIIRequests'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject',
        }
      ],
      documentation: `Prevents a new request being put to the dao if 
                      there is already an active request assosciated with the user`,
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestsDAO");
  User user = (User) x.get("user");
  
  if ( obj.getProperty("viewRequestStatus").equals(net.nanopay.security.PII.PIIRequestStatus.PENDING)){
    // get pending or valid and approved PII requests for current user 
    Count count = (Count) vprDAO.where(
      MLang.OR(
        (MLang.AND(
          MLang.EQ(ViewPIIRequests.CREATED_BY, user.getId() ),
          MLang.EQ(ViewPIIRequests.VIEW_REQUEST_STATUS, PIIRequestStatus.PENDING))
        ),
        (MLang.AND(
          MLang.EQ(ViewPIIRequests.CREATED_BY, user.getId() ),
          MLang.EQ(ViewPIIRequests.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
          MLang.GT(ViewPIIRequests.REQUEST_EXPIRES_AT , new Date() ))
        )
      )
    ).select(new Count());

    if ( count.getValue() > 0 ) {
      return null;
    }
  }
  return getDelegate().put_(x, obj);
  `
    },
  ]
});

