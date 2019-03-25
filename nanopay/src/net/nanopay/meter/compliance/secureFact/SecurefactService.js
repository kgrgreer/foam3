foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'SecurefactService',

  documentation: `Securefact service which communicates with SIDni and LEV APIs
    for individual identity verification and business entity search.`,

  imports: [
    'securefactLEVDAO',
    'securefactSIDniDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.nanos.logger.Logger',
    'java.util.Arrays',
    'java.util.Base64',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResult',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.util.EntityUtils'
  ],

  properties: [
    {
      class: 'String',
      name: 'sidniUrl',
      label: 'SIDni URL'
    },
    {
      class: 'String',
      name: 'sidniApiKey',
      label: 'SIDni API Key'
    },
    {
      class: 'String',
      name: 'levUrl',
      label: 'LEV URL'
    },
    {
      class: 'String',
      name: 'levApiKey',
      label: 'LEV API Key'
    }
  ],

  methods: [
    {
      name: 'sidniVerify',
      type: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        SecurefactRequest request = SecurefactRequestGenerator.getSIDniRequest(x, user);
        request.setUrl(getSidniUrl());
        request.setAuthKey(getSidniApiKey());

        SIDniResponse response = (SIDniResponse) sendRequest(x, request, SIDniResponse.class);
        response.setEntityName(user.getLegalName());
        response.setEntityId(user.getId());
        return (SIDniResponse)
          ((DAO) getSecurefactSIDniDAO()).put(response);
      `
    },
    {
      name: 'levSearch',
      type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        }
      ],
      javaCode: `
        SecurefactRequest request = SecurefactRequestGenerator.getLEVRequest(x, business);
        request.setUrl(getLevUrl());
        request.setAuthKey(getLevApiKey());

        LEVResponse response = (LEVResponse) sendRequest(x, request, LEVResponse.class);
        response.setEntityName(business.getBusinessName());
        response.setEntityId(business.getId());
        // Aggregate close matches
        LEVResult[] results = response.getResults();
        long closeMatchCounter = Arrays.stream(results).filter(
          o -> o.getCloseMatch()
        ).count();
        response.setCloseMatches(closeMatchCounter + "/" + results.length);
        return (LEVResponse)
          ((DAO) getSecurefactLEVDAO()).put(response);
      `
    },
    {
      name: 'sendRequest',
      type: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'request',
          type: 'net.nanopay.meter.compliance.secureFact.SecurefactRequest'
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
          String basicAuth = request.getAuthKey() + ":";
          StringEntity entity = new StringEntity(
            new Outputter().setOutputClassNames(false).stringify(request));
          entity.setContentType("application/json");

          httpPost.addHeader("Content-type", "application/json");
          httpPost.setHeader("Authorization", "Basic " +
            Base64.getEncoder().encodeToString(basicAuth.getBytes()));
          httpPost.setEntity(entity);
          httpResponse =  httpClient.execute(httpPost);
          if ( httpResponse.getStatusLine().getStatusCode() >= 500 ) {
            throw new Exception("Securefact server error.");
          }

          String responseJson = EntityUtils.toString(httpResponse.getEntity());
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          SecurefactResponse response = (SecurefactResponse)
            jsonParser.parseString(responseJson, responseClass);
          response.setStatusCode(httpResponse.getStatusLine().getStatusCode());
          return response;
        } catch(Exception e) {
          String message = String.format("Securefact %s failed.", request.getClass().getSimpleName());
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
