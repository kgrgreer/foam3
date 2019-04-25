foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindService',

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.Base64',
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
      name: 'baseUrl',
      value: 'https://staging.identitymind.com/im'
    },
    {
      class: 'String',
      name: 'apiUser',
      value: 'nanopay'
    },
    {
      class: 'String',
      name: 'apiKey',
      value: '80c264cb0c381fbc995763982b35e965f37347eb'
    },
    {
      class: 'String',
      name: 'hashingSalt',
      value: '54l73D47'
    },
    {
      class: 'String',
      name: 'profile',
      value: 'DEFAULT'
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
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getConsumerKYCRequest(x, consumer);
        request.setUrl(getBaseUrl() + "/account/consumer");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getProfile());
        request.setStage(stage);

        IdentityMindResponse response = (IdentityMindResponse) sendRequest(
          x, request, IdentityMindResponse.class);
        response.setApiName("Consumer KYC Evaluation");
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
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
        request.setProfile(getProfile());

        IdentityMindResponse response = (IdentityMindResponse) sendRequest(
          x, request, IdentityMindResponse.class);
        response.setApiName("Entity Login Record");
        User user = login.findLoginAttemptedFor(x);
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
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
          name: 'stage',
          type: 'Integer'
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getMerchantKYCRequest(x, business);
        request.setUrl(getBaseUrl() + "/account/merchant");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getProfile());
        request.setStage(stage);

        IdentityMindResponse response = (IdentityMindResponse) sendRequest(
          x, request, IdentityMindResponse.class);
        response.setApiName("Merchant KYC Evaluation");
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
        return (IdentityMindResponse)
          ((DAO) getIdentityMindResponseDAO()).put(response);
      `
    },
    {
      name: 'evaluateFunding',
      type: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.cico.CITransaction'
        }
      ],
      javaCode: `
        IdentityMindRequest request = IdentityMindRequestGenerator.getFundingRequest(x, transaction);
        request.setUrl(getBaseUrl() + "/account/transferin");
        request.setBasicAuth(getApiUser() + ":" + getApiKey());
        request.setProfile(getProfile());

        IdentityMindResponse response = (IdentityMindResponse) sendRequest(
          x, request, IdentityMindResponse.class);
        response.setApiName("Funding");
        response.setEntityType(request.getEntityType());
        response.setEntityId(request.getEntityId());
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
        },
        {
          name: 'responseClass',
          javaType: 'java.lang.Class'
        }
      ],
      javaCode: `
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(request.getUrl());
        HttpResponse httpResponse = null;

        try {
          Outputter jsonOutputter = new Outputter(OutputterMode.NETWORK).setOutputClassNames(false);
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
            jsonParser.parseString(responseJson, responseClass);
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
    }
  ]
});
