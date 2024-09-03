foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'JWTAuthService',
    extends: 'foam.nanos.auth.ProxyAuthService',
    imports: [
        'foam.nanos.auth.AuthService auth',
        'foam.dao.DAO localUserDAO',
        'foam.nanos.auth.UniqueUserService uniqueUserService',
        'foam.dao.DAO jwkDAO',
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
            String signatureb64 = parts[2];
            
            logger.log("header", headerb64, "body", bodyb64);
            
            byte[] headerBytes = java.util.Base64.getUrlDecoder().decode(headerb64);
            byte[] bodyBytes = java.util.Base64.getUrlDecoder().decode(bodyb64);
            byte[] signatureBytes = java.util.Base64.getUrlDecoder().decode(signatureb64);
            
            String header = new String(headerBytes, java.nio.charset.StandardCharsets.UTF_8);
            String body = new String(bodyBytes, java.nio.charset.StandardCharsets.UTF_8);
            
            javax.json.JsonReader reader = javax.json.Json.createReader(new java.io.StringReader(header));
            javax.json.JsonObject headerObject = reader.readObject();
            reader.close();
            
            reader = javax.json.Json.createReader(new java.io.StringReader(body));
            javax.json.JsonObject bodyObject = reader.readObject();
            reader.close();

            java.security.Signature signature;
            
            try {
                switch (headerObject.getString("alg")) {
                    case "RS256":
                        signature = java.security.Signature.getInstance("SHA256withRSA");
                        String keyId = headerObject.getString("kid");
                        String issuer = bodyObject.getString("iss");
                        
                        RSA256JWK jwk = (RSA256JWK)(getJwkDAO().find(new JWKId(keyId, issuer)));
                        if (jwk == null) {
                          throw new AuthenticationException("no key found for jwt");
                        }
                        if (!jwk.getTrusted()) {
                          throw new AuthenticationException("jwt key untrusted");
                        }
                        
                        // Base64 URL decode the modulus and exponent
                        byte[] modulusBytes = java.util.Base64.getUrlDecoder().decode(jwk.getN());
                        byte[] exponentBytes = java.util.Base64.getUrlDecoder().decode(jwk.getE());
    
                        // Convert to BigInteger
                        java.math.BigInteger modulus = new java.math.BigInteger(1, modulusBytes);
                        java.math.BigInteger exponent = new java.math.BigInteger(1, exponentBytes);
    
                        // Create a KeySpec from modulus and exponent
                        java.security.spec.RSAPublicKeySpec keySpec = new java.security.spec.RSAPublicKeySpec(modulus, exponent);
    
                        java.security.PublicKey publicKey = java.security.KeyFactory.getInstance("RSA")
                                .generatePublic(keySpec);
    
                        signature.initVerify(publicKey);
                        break;
                    default:
                        throw new AuthenticationException("Unsupported signature algorithm");
                }
            } catch (java.security.NoSuchAlgorithmException | java.security.spec.InvalidKeySpecException | java.security.InvalidKeyException e) {
              throw new AuthenticationException("Unsupported signature algorithm", e);
            }
     
            try {
                signature.update((headerb64 + "." + bodyb64).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            
                if (!signature.verify(signatureBytes)) {
                    throw new AuthenticationException("JWT signature does not match");
                }
            } catch (java.security.SignatureException e) {
              throw new AuthenticationException("error validating signature", e);
            }
                      
            if (!bodyObject.getBoolean("email_verified")) {
                throw new AuthenticationException("email is not verified");
            }
            
            if (bodyObject.getInt("exp", Integer.MAX_VALUE) < java.time.Instant.now().getEpochSecond()) {
                throw new AuthenticationException("expired token");
            }
            
            String expectedAudience = ((foam.nanos.app.AppConfig)(x.get("appConfig"))).getGoogleSignInClientId();
            
            if (!bodyObject.getString("aud").equals(expectedAudience)) {
                throw new AuthenticationException("incorrect audience");
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