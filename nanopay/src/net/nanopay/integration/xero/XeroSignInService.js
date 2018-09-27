/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'XeroSignInService',
  extends: 'net.nanopay.integration.xero.AbstractSignInService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'com.xero.api.XeroClient',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
      {
        name: 'isSignedIn',
        javaCode:`
try {
  DAO                 store        = (DAO) x.get("tokenStorageDAO");
  TokenStorage        tokenStorage = (TokenStorage) store.find(user.getId());
  if (tokenStorage == null) return false;
  XeroConfig config = new XeroConfig();
  XeroClient client_ = new XeroClient(config);
  client_.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
  client_.getContacts();
  return true;
}  catch (Exception e) {
  e.printStackTrace();
}
return false;`
    },
  ]
});
