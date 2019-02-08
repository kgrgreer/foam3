foam.CLASS({
    package: 'net.nanopay.meter.compliance.secureFact.sidni',
    name: 'SIDniRequestService',

  javaImports: [
    'foam.lib.json.JSONParser',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniAddress',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniName',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniCustomer',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniPhone',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniErrors',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.HttpResponse',
    'org.apache.http.entity.ContentType',
    'java.util.Base64',
    'org.apache.http.util.EntityUtils',
    'java.text.SimpleDateFormat',
  ],

  methods: [
    {
      name: 'createRequest',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaReturns: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest',
      javaCode: `
      SIDniRequest request = new SIDniRequest();
      SIDniCustomer customer = new SIDniCustomer();
      SIDniName name = new SIDniName();
      SIDniAddress address = new SIDniAddress();
      SIDniAddress[] addresses = new SIDniAddress[1];
      int numberOfPhones = 0;
      Boolean homeAndMobile = false, mobile = false, homePhone = false;
      // We don't know what type of phone number the phone field could be; might be mobile or home phone. Set it to both if only phone field is set.
      if (!user.getPhone().getNumber().equals("") ) {
        numberOfPhones++;
        homePhone = true;
        if (!user.getMobile().getNumber().equals("") ) {
          mobile = true;
          numberOfPhones++;
        } else {
          homeAndMobile = true;
          numberOfPhones++;
        }
      } else if (!user.getMobile().getNumber().equals("")) {
        numberOfPhones++;;
        mobile = true;
      }
      SIDniPhone[] phones = new SIDniPhone[numberOfPhones];

      //build customer
      customer.setUserReference(user.getId()+"");
      customer.setConsentGranted(true);
      customer.setLanguage("en-CA");

      //build name
      name.setFirstName(user.getFirstName());
      name.setLastName(user.getLastName());
      if ( user.getMiddleName() !=null && user.getMiddleName() !="") {
        name.setMiddleName(user.getMiddleName());
      }

      //build address
      address.setAddressType("Current");
      address.setAddressLine(user.getAddress().getAddress());
      address.setCity(user.getAddress().getCity());
      address.setProvince(user.getAddress().getRegionId());
      address.setPostalCode(user.getAddress().getPostalCode());
      addresses[0] = address;

      //build phone
      if (homePhone) {
        SIDniPhone phoneNumber = new SIDniPhone();
        phoneNumber.setType("HOME");
        phoneNumber.setNumber(user.getPhone().getNumber());
        phones[--numberOfPhones] = phoneNumber;
      }
      if (homeAndMobile) {
        SIDniPhone phoneNumber = new SIDniPhone();
        phoneNumber.setType("MOBILE");
        phoneNumber.setNumber(user.getPhone().getNumber());
        phones[--numberOfPhones] = phoneNumber;
      }
      if (mobile) {
        SIDniPhone phoneNumber = new SIDniPhone();
        phoneNumber.setType("MOBILE");
        phoneNumber.setNumber(user.getMobile().getNumber());
        phones[--numberOfPhones] = phoneNumber;
      }

      request.setCustomer(customer);
      request.setName(name);
      request.setAddress(addresses);
      if (homePhone || mobile) {
        request.setPhone(phones);
      }

      SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
      dateFormat.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      request.setDateOfBirth(dateFormat.format(user.getBirthday()));
      return request;
      `
    },
    {
      name: 'sendRequest',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest'
        }
      ],
      javaReturns: 'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',
      javaCode: `
      // key must end with :" 
      String key = "insertKeyHere:";
      CloseableHttpClient httpClient = HttpClients.createDefault();

      HttpPost httpPost = new HttpPost("https://qa2-sidni.securefact.com/rest/v3/verifyIndividual");
      httpPost.addHeader("Content-type", "application/json");
      httpPost.setHeader("Authorization", "Basic " + Base64.getEncoder().encodeToString(key.getBytes()));

      System.out.println(request.toJSON());

      StringEntity entity;
          try {
            entity = new StringEntity(request.toJSON());
            entity.setContentType(ContentType.APPLICATION_JSON.getMimeType());
            httpPost.setEntity(entity);
            HttpResponse response =  httpClient.execute(httpPost);
            System.out.println(response);
            String responseJson = EntityUtils.toString(response.getEntity());
            System.out.println(responseJson);
            JSONParser parser = new JSONParser();
            if (response.getStatusLine().getStatusCode() == 200 ) {
              SIDniResponse sidniResponse = (SIDniResponse) parser.parseString(responseJson, SIDniResponse.class);
              sidniResponse.setHttpCode(response.getStatusLine().getStatusCode()+"");
              return sidniResponse;
            } else if (response.getStatusLine().toString().startsWith("4")){
              SIDniErrors sidniErrors = (SIDniErrors) parser.parseString(responseJson, SIDniErrors.class);
              System.out.println(sidniErrors);
              sidniErrors.setHttpCode(response.getStatusLine().getStatusCode()+"");
              return sidniErrors;
            } else if (response.getStatusLine().toString().startsWith("5")){
              SIDniErrors sidniErrors = new SIDniErrors();
              sidniErrors.setHttpCode(response.getStatusLine().getStatusCode()+"");
              return sidniErrors;
            }
          } catch(Exception e) {
            System.out.println(e.getStackTrace());
            return null;
          }
          return null;

      `
    },
  ]
});
