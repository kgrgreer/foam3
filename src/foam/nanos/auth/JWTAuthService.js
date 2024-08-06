foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'JWTAuthService',
    extends: 'foam.nanos.auth.ProxyAuthService',
    imports: [
        'foam.nanos.auth.AuthService auth',
        'foam.dao.DAO localUserDAO',
        'foam.nanos.auth.UniqueUserService uniqueUserService',
    ],
    methods: [
        {
            name: 'loginWithCredentials',
            javaCode: `
            if ( ! ( credentials instanceof JWTCredentials ) ) {
              return getDelegate().loginWithCredentials(x, credentials);
            }
            
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger)(x.get("logger"));
            
            JWTCredentials creds = (JWTCredentials)credentials;
            
            logger.log("jwt login", creds.getToken());
             
            String parts[] = creds.getToken().split("\\\\.");
            logger.log("jwt parts", parts.length);
            String headerb64 = parts[0];
            String bodyb64 = parts[1];
            
            logger.log("header", headerb64, "body", bodyb64);
            
            byte[] headerBytes = java.util.Base64.getUrlDecoder().decode(headerb64);
            byte[] bodyBytes = java.util.Base64.getUrlDecoder().decode(bodyb64);
            
            String header = new String(headerBytes, java.nio.charset.StandardCharsets.UTF_8);
            String body = new String(bodyBytes, java.nio.charset.StandardCharsets.UTF_8);
            
            javax.json.JsonReader reader = javax.json.Json.createReader(new java.io.StringReader(header));
            javax.json.JsonObject headerObject = reader.readObject();
            reader.close();
            
            reader = javax.json.Json.createReader(new java.io.StringReader(body));
            javax.json.JsonObject bodyObject = reader.readObject();
            reader.close();
            
            // TODO validate JWT
            
            if (!bodyObject.getBoolean("email_verified")) {
                throw new AuthenticationException("email is not verified");
            }
            
            String email = bodyObject.getString("email");
            
            User user = getUniqueUserService().getUser(x, email);
            
            if ( user == null ) {
              throw new UserNotFoundException();
            }
            
            return foam.nanos.auth.UserAndGroupAuthService.loginUser(getX(), x, user);
            `
        }
    ]
})