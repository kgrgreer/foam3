foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVRequestService',

  javaImports: [
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.nanos.auth.Address',
    'foam.nanos.logger.Logger',
    'java.util.Base64',
    'net.nanopay.meter.compliance.secureFact.SecurefactCredentials',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
    'net.nanopay.model.BusinessType',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.util.EntityUtils'
  ],

  methods: [
    {
      name: 'createRequest',
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
      type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest',
      javaCode: `
        LEVRequest request = new LEVRequest();
        request.setSearchType("name");
        request.setEntityName(business.getBusinessName());

        Address address = business.getAddress();
        if ( address == null ) {
          throw new IllegalStateException("Business address can't be null");
        }
        request.setCountry(address.getCountryId());
        request.setJurisdiction(address.getRegionId());
        request.setAddress(address.getPostalCode());

        BusinessType businessType = business.findBusinessTypeId(x);
        if ( businessType != null ) {
          String entityType = businessType.getName();
          if ( entityType.equals("Corporation")
            || entityType.equals("Sole Proprietorship")
            || entityType.equals("Partnership")
            || entityType.equals("Trade Name")
          ) {
            request.setEntityType(business.getType());
          }
        }
        return request;
      `
    },
    {
      name: 'sendRequest',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'request',
          type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest'
        }
      ],
      type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
      javaCode: `
        SecurefactCredentials credentials = (SecurefactCredentials) x.get("secureFactCredentials");
        CloseableHttpClient   httpClient = HttpClients.createDefault();
        HttpPost              httpPost = new HttpPost(credentials.getLevUrl());
        HttpResponse          response = null;

        try {
          String basicAuth = credentials.getLevApiKey() + ":";
          StringEntity entity = new StringEntity(
            new Outputter().setOutputClassNames(false).stringify(request));
          entity.setContentType("application/json");
          httpPost.addHeader("Content-type", "application/json");
          httpPost.setHeader("Authorization", "Basic " +
            Base64.getEncoder().encodeToString(basicAuth.getBytes()));
          httpPost.setEntity(entity);

          response =  httpClient.execute(httpPost);
          if ( response.getStatusLine().getStatusCode() >= 500 ) {
            throw new Exception("Securefact server error.");
          }

          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          return (LEVResponse) jsonParser.parseString(
            EntityUtils.toString(response.getEntity()), LEVResponse.class);
        } catch(Exception e) {
          StringBuilder sb = new StringBuilder();
          sb.append("Securefact LEV request service failed.");
          if ( response != null ) {
            sb.append(" HTTP status code: ")
              .append(response.getStatusLine().getStatusCode())
              .append(".");
          }
          ((Logger) x.get("logger")).error(sb.toString(), e);
          throw new RuntimeException(sb.toString());
        }
      `
    },
  ]
});
