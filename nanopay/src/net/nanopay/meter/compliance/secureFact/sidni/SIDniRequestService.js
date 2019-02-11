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
      javaReturns: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
      javaCode: `
      // key must end with :" 
      String key = "NTc5MDk0MDc5OTUyNzMxMDYwNzg1NDgxMTQ3OTkwNDI4MDkwMzY4:";
      CloseableHttpClient httpClient = HttpClients.createDefault();

      HttpPost httpPost = new HttpPost("https://qa2-sidni.securefact.com/rest/v3/verifyIndividual");
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
              SIDniResponse sidniResponse = (SIDniResponse) parser.parseString(responseJson, SIDniResponse.class);
              sidniResponse.setHttpCode(response.getStatusLine().getStatusCode()+"");
              sidniResponse.setUserReference(request.getCustomer().getUserReference());
              return sidniResponse;
          } catch(Exception e) {
            return null;
          }
      `
    },
  ]
});
