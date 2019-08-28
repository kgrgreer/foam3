foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindService',

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.NetworkPropertyPredicate',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.Base64',
    'net.nanopay.tx.model.Transaction',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.util.EntityUtils'
  ],

  imports: [
    'identityMindResponseDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'baseUrl'
    },
    {
      class: 'String',
      name: 'apiUser'
    },
    {
      class: 'String',
      name: 'apiKey'
    },
    {
      class: 'String',
      name: 'hashingSalt'
    },
    {
      class: 'String',
      name: 'defaultProfile',
      value: 'DEFAULT'
    },
    {
      class: 'Boolean',
      name: 'alwaysUseDefaultProfile',
      value: false
    }
  ],

  methods: [
    {
      name: 'evaluateConsumer',
      type: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'consumer',
          type: 'foam.core.FObject'
        },
        {
          name: 'stage',
          type: 'Integer'
        },
        {
          name: 'memos',
          type: 'Map'
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getConsumerKYCRequest(x, consumer);
        request.setUrl(getBaseUrl() + "/account/consumer");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getProfile((Address) consumer.getProperty("address")));
        request.setStage(stage);

        Integer memo3 = (Integer) memos.get("memo3");
        Boolean memo4 = (Boolean) memos.get("memo4");
        if ( memo3 != null ) {
          request.setMemo3(memo3);
        }
        if ( memo4 != null ) {
          request.setMemo4(memo4);
        }

        IdentityMindResponse response = sendRequest(x, request);
        response.setApiName("Consumer KYC Evaluation");
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
        response.setDaoKey(request.getDaoKey());
        return (IdentityMindResponse)
          ((DAO) getIdentityMindResponseDAO()).put(response);
      `
    },
    {
      name: 'recordLogin',
      type: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'login',
          type: 'net.nanopay.auth.LoginAttempt'
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getEntityLoginRequest(x, login);
        request.setUrl(getBaseUrl() + "/account/login");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getDefaultProfile());

        IdentityMindResponse response = sendRequest(x, request);
        response.setApiName("Entity Login Record");
        User user = login.findLoginAttemptedFor(x);
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
        response.setDaoKey(request.getDaoKey());
        return (IdentityMindResponse)
          ((DAO) getIdentityMindResponseDAO()).put(response);
      `
    },
    {
      name: 'evaluateMerchant',
      type: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        },
        {
          name: 'memos',
          type: 'Map'
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getMerchantKYCRequest(x, business);
        request.setUrl(getBaseUrl() + "/account/merchant");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getProfile(business.getAddress()));

        Integer memo3 = (Integer) memos.get("memo3");
        Boolean memo5 = (Boolean) memos.get("memo5");
        if ( memo3 != null ) {
          request.setMemo3(memo3);
        }
        if ( memo5 != null ) {
          request.setMemo5(memo5);
        }
    
        IdentityMindResponse response = sendRequest(x, request);
        response.setApiName("Merchant KYC Evaluation");
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
        response.setDaoKey(request.getDaoKey());
        return (IdentityMindResponse)
          ((DAO) getIdentityMindResponseDAO()).put(response);
      `
    },
    {
      name: 'evaluateTransfer',
      type: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getTransferRequest(x, transaction);
        request.setUrl(getBaseUrl() + "/account/transfer");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getDefaultProfile());

        IdentityMindResponse response = sendRequest(x, request);
        response.setApiName("Transfer");
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
        response.setDaoKey(request.getDaoKey());
        return (IdentityMindResponse)
          ((DAO) getIdentityMindResponseDAO()).put(response);
      `
    },
    {
      name: 'sendRequest',
      type: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'request',
          type: 'net.nanopay.meter.compliance.identityMind.IdentityMindRequest'
        }
      ],
      javaCode: `
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(request.getUrl());
        HttpResponse httpResponse = null;

        try {
          Outputter jsonOutputter = new Outputter(x).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false);
          String requestJson = jsonOutputter.stringify(request);
          StringEntity entity = new StringEntity(requestJson);
          entity.setContentType("application/json");

          httpPost.addHeader("Content-type", "application/json");
          httpPost.addHeader("Authorization", "Basic " +
            Base64.getEncoder().encodeToString(request.getBasicAuth().getBytes()));
          httpPost.setEntity(entity);
          httpResponse = httpClient.execute(httpPost);
          if ( httpResponse.getStatusLine().getStatusCode() >= 500 ) {
            throw new Exception("IdentityMind server error.");
          }

          String responseJson = EntityUtils.toString(httpResponse.getEntity());
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          IdentityMindResponse response = (IdentityMindResponse)
            jsonParser.parseString(responseJson, IdentityMindResponse.class);
          response.setRequestJson(requestJson);
          response.setStatusCode(httpResponse.getStatusLine().getStatusCode());
          return response;
        } catch(Exception e) {
          String message = String.format("IdentityMind %s failed.", request.getClass().getSimpleName());
          if ( httpResponse != null ) {
            message += String.format(" HTTP status code: %d.", httpResponse.getStatusLine().getStatusCode());
          }
          ((Logger) x.get("logger")).error(message, e);
          throw new RuntimeException(message);
        }
      `
    },
    {
      name: 'getProfile',
      type: 'String',
      args: [
        {
          name: 'address',
          type: 'foam.nanos.auth.Address'
        }
      ],
      javaCode: `
        if ( ! getAlwaysUseDefaultProfile()
          && address != null
          && ! SafetyUtil.isEmpty(address.getCountryId())
        ) {
          // Use hard-coded "nanopay" prefix for IdentityMind profile as we only
          // need to scale by user countries at the moment.
          //
          // TODO: Discuss using spid for user segmentation to support scaling by products as well.
          return String.format("nanopay%s", address.getCountryId());
        }
        return getDefaultProfile();
      `
    }
  ]
});
