foam.CLASS({
  package: 'net.nanopay.onboarding',
  name: 'FirebaseInvitationTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  imports: [
    'appConfig',
    'localTransactionDAO',
    'localUserDAO',
    'tokenDAO'
  ],

  javaImports: [
  'foam.dao.DAO',
  'foam.nanos.app.AppConfig',
  'foam.nanos.auth.token.Token',

  'java.util.Calendar',
  'java.util.UUID'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
  @Override
  protected StringBuilder initialValue() {
    return new StringBuilder();
  }

  @Override
  public StringBuilder get() {
    StringBuilder b = super.get();
    b.setLength(0);
    return b;
  }
};`
        }))
      }
    }
  ],

  constants: [
    {
      type: 'String',
      name: 'FIREBASE_DYNAMIC_URL',
      value: 'http://n43qr.app.goo.gl',
      swiftType: 'String',
      swiftValue: '"http://n43qr.app.goo.gl"'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'apn'
    },
    {
      class: 'String',
      name: 'dfl'
    },
    {
      class: 'String',
      name: 'ibi'
    },
    {
      class: 'String',
      name: 'isi'
    }
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(Calendar.DAY_OF_MONTH, 30);
return calendar.getTime();`
    },

    {
      name: 'generateTokenWithParameters',
      javaCode:
`AppConfig config = (AppConfig) getAppConfig();
DAO tokenDAO = (DAO) getTokenDAO();
DAO userDAO = (DAO) getLocalUserDAO();
String url = config.getUrl().replaceAll("/$", "");

Token token = (Token) tokenDAO.put(new Token.Builder(getX())
  .setExpiry(generateExpiryDate())
  .setData(UUID.randomUUID().toString())
  .setParameters(parameters)
  .build());

StringBuilder builder = sb.get()
    .append(FIREBASE_DYNAMIC_URL)
    .append("?link=").append(url).append("/appRedirect")
    .append("?token=").append(token.getData())
    .append("&apn=").append(getApn())
    .append("&ibi=").append(getIbi())
    .append("&isi=").append(getIsi())
    .append("&dfl=").append(getDfl());

return false;`
    },

    {
      name: 'processToken',
      javaCode: `return false;`
    }
  ]
});