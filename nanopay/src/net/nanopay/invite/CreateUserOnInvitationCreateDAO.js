foam.CLASS({
  package: 'net.nanopay.invite',
  name: 'CreateUserOnInvitationCreateDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Creates a new user in the user DAO when a new invitation is created',

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.Email',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
`Invitation invitation = (Invitation) obj;
boolean newInvitation = super.find(invitation.getId()) == null;

if ( newInvitation ) {
  // check if user is not empty
  User user = invitation.getUser();
  if ( user == null ) {
    throw new RuntimeException("Invalid User");
  }

  // check if email is not empty
  String email = user.getEmail();
  if ( SafetyUtil.isEmpty(email) ) {
    throw new RuntimeException("Email required");
  }

  // validate email
  if ( ! Email.isValid(email) ) {
    throw new RuntimeException("Invalid Email");
  }

  // check if user already exists
  DAO userDAO = (DAO) getLocalUserDAO();
  if ( userDAO.inX(x).find(EQ(User.EMAIL, email.toLowerCase())) != null ) {
    throw new RuntimeException("Email ID already registered with an existing invite");
  }

  // store the invited user in the user dao
  ((DAO) getLocalUserDAO()).put(user);
}

return super.put_(x, obj);`
    }
  ]
});
