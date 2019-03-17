foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniRequestService',

  javaImports: [
    'foam.core.X',
    'foam.lib.json.JSONParser',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.text.SimpleDateFormat',
    'java.util.ArrayList',
    'java.util.Base64',
    'java.util.List',
    'java.util.TimeZone',
    'net.nanopay.meter.compliance.secureFact.sidni.model.*',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.ContentType',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.util.EntityUtils',
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
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      type: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest',
      javaCode: `
        return new SIDniRequest.Builder(x)
          .setCustomer(buildCustomer(x, user))
          .setName(buildName(x, user))
          .setAddress(buildAddress(x, user))
          .setPhone(buildPhone(x, user))
          .setDateOfBirth(buildDateOfBirth(x, user))
          .build();
      `
    },
    {
      name: 'sendRequest',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniRequest'
        }
      ],
      type: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse',
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
        sidniResponse.setHttpCode(response.getStatusLine().getStatusCode() + "");
        sidniResponse.setUserReference(request.getCustomer().getUserReference());
        return sidniResponse;
      } catch(Exception e) {
        return null;
      }
      `
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected SIDniCustomer buildCustomer(X x, User user) {
            return new SIDniCustomer.Builder(x)
              .setUserReference(String.valueOf(user.getId()))
              // TODO: Need record of consent for user personal information to be searched by Securefact
              .setConsentGranted(true)
              .build();
          }

          protected SIDniName buildName(X x, User user) {
            if ( SafetyUtil.isEmpty(user.getFirstName())
              || SafetyUtil.isEmpty(user.getLastName())
            ) {
              throw new IllegalStateException("User firstName or lastName can't be blank");
            }
            SIDniName name = new SIDniName.Builder(x)
              .setFirstName(user.getFirstName())
              .setLastName(user.getLastName())
              .build();
            if ( ! SafetyUtil.isEmpty(user.getMiddleName()) ) {
              name.setMiddleName(user.getMiddleName());
            }
            return name;
          }

          protected SIDniAddress[] buildAddress(X x, User user) {
            Address userAddress = user.getAddress();
            if ( SafetyUtil.isEmpty(userAddress.getAddress()) ) {
              throw new IllegalStateException("User address can't be blank");
            }
            return new SIDniAddress[] {
              new SIDniAddress.Builder(x)
                .setAddressType("Current")
                .setAddressLine(userAddress.getAddress())
                .setCity(userAddress.getCity())
                .setProvince(userAddress.getRegionId())
                .setPostalCode(userAddress.getPostalCode())
                .build()
            };
          }

          protected SIDniPhone[] buildPhone(X x, User user) {
            List<SIDniPhone> list = new ArrayList<>();
            boolean hasMobile = false;

            Phone mobile = user.getMobile();
            if ( ! SafetyUtil.isEmpty(mobile.getNumber()) ) {
              list.add(
                new SIDniPhone.Builder(x)
                  .setType("MOBILE")
                  .setNumber(mobile.getNumber())
                  .build()
              );
              hasMobile = true;
            }
            Phone phone = user.getPhone();
            if ( ! SafetyUtil.isEmpty(phone.getNumber()) ) {
              list.add(
                new SIDniPhone.Builder(x)
                  .setType("HOME")
                  .setNumber(phone.getNumber())
                  .build()
              );
              if ( ! hasMobile ) {
                list.add(
                  new SIDniPhone.Builder(x)
                    .setType("MOBILE")
                    .setNumber(phone.getNumber())
                    .build()
                );
              }
            }
            return list.toArray(new SIDniPhone[0]);
          }

          protected String buildDateOfBirth(X x, User user) {
            if ( user.getBirthday() == null ) {
              throw new IllegalStateException("User birthday can't be null");
            }
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            return dateFormat.format(user.getBirthday());
          }
        `);
      }
    }
  ]
});
