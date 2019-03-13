foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVRequestService',

javaImports: [
  'foam.lib.json.JSONParser',
  'java.util.Base64',
  'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest',
  'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
  'org.apache.http.HttpResponse',
  'org.apache.http.client.methods.HttpPost',
  'org.apache.http.entity.ContentType',
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
        name: 'business',
        type: 'net.nanopay.model.Business'
      }
    ],
    type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest',
    javaCode: `
    LEVRequest request = new LEVRequest();

    request.setSearchType("name");
    request.setEntityName(business.getBusinessName());
    request.setJurisdiction(business.getAddress().getRegionId());
    request.setCountry("CA");
    request.setAddress(business.getAddress().getPostalCode());
    if ( business.getType().equals("Corporation") || business.getType().equals("Sole Proprietorship") || business.getType().equals("Partnership") ) {
      request.setEntityType(business.getType());
    }

    return request;
    `
  },
  {
    name: 'sendRequest',
    args: [
      {
        name: 'request',
        type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest'
      }
    ],
    type: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
    javaCode: `
    // key must end with :" 
    String key = "ODA1NTMyNjA0MTAyNDg2NzIxMzg4NTk0MTQ4ODg0NTI1MDg4NzY4:";
    CloseableHttpClient httpClient = HttpClients.createDefault();

    HttpPost httpPost = new HttpPost("https://lev3uat.securefact.com/rest/v1/lev/search");
    httpPost.addHeader("Content-type", "application/json");
    httpPost.setHeader("Authorization", "Basic " + Base64.getEncoder().encodeToString(key.getBytes()));
    StringEntity entity;
        try {
          entity = new StringEntity(request.toJSON());
          entity.setContentType(ContentType.APPLICATION_JSON.getMimeType());
          httpPost.setEntity(entity);
          HttpResponse response =  httpClient.execute(httpPost);
          String responseJson = EntityUtils.toString(response.getEntity());
          JSONParser parser = new JSONParser();
          LEVResponse levResponse = (LEVResponse) parser.parseString(responseJson, LEVResponse.class);
          levResponse.setHttpCode(response.getStatusLine().getStatusCode()+"");
          return levResponse;
        } catch(Exception e) {
          return null;
        }
    `
  },
]
});
