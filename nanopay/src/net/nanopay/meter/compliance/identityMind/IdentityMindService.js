/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'IdentityMindService',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.NetworkPropertyPredicate',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.Base64',
    'java.util.Map',
    'java.util.HashMap',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
    'net.nanopay.tx.model.Transaction',
    'org.apache.http.HttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.ContentType',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.util.EntityUtils',
    'static foam.mlang.MLang.*'
  ],

  imports: [
    'DAO identityMindResponseDAO'
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
      var pm = new PM(IdentityMindService.getOwnClassInfo().getId(), "evaluateConsumer");

      try {
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
      } catch (Throwable t) {
        pm.error(x, t.getMessage());
        throw t;
      } finally {
        pm.log(x);
      }
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
      var pm = new PM(IdentityMindService.getOwnClassInfo().getId(), "recordLogin");

      try {
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
      } catch (Throwable t) {
        pm.error(x, t.getMessage());
        throw t;
      } finally {
        pm.log(x);
      }
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
      var pm = new PM(IdentityMindService.getOwnClassInfo().getId(), "evaluateMerchant");

      try {
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
      } catch (Throwable t) {
        pm.error(x, t.getMessage());
        throw t;
      } finally {
        pm.log(x);
      }
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
      var pm = new PM(IdentityMindService.getOwnClassInfo().getId(), "evaluateTransfer");

      try {
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
      } catch(Throwable t) {
        pm.error(x, t.getMessage());
        throw t;
      } finally {
        pm.log(x);
      }
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
          StringEntity entity = new StringEntity(requestJson, "UTF-8");

          httpPost.addHeader("Content-type", "application/json");
          httpPost.addHeader("Accept-Encoding", "UTF-8");
          httpPost.addHeader("Authorization", "Basic " +
            Base64.getMimeEncoder().encodeToString(request.getBasicAuth().getBytes()));
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
    },
    {
      name: 'fetchMemos',
      type: 'Map',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'isConsumer',
          type: 'Boolean'
        },
        {
          name: 'searchId',
          type: 'Long'
        },
        {
          name: 'searchType',
          type: 'String'
        }
      ],
      javaCode: `
        Map<String, Object> memoMap = new HashMap<String, Object>();
        Integer dowJonesMatches = fetchDowJonesMatches(x, searchId, searchType);
        memoMap.put("memo3", dowJonesMatches);
        if ( isConsumer ) {
          Boolean SIDniResult = fetchSecureFactSIDniResult(x, searchId);
          memoMap.put("memo4", SIDniResult);
        } else {
          Boolean LEVResult = fetchSecureFactLEVResult(x, searchId);
          memoMap.put("memo5", LEVResult);
        }
        return memoMap;
      `
    },
    {
      name: 'fetchDowJonesMatches',
      type: 'Integer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchId',
          type: 'Long'
        },
        {
          name: 'searchType',
          type: 'String'
        }
      ],
      javaCode: `
        DAO dowJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");
        ArraySink sink = (ArraySink) dowJonesResponseDAO.where(
          AND(
            EQ(DowJonesResponse.USER_ID, searchId),
            EQ(DowJonesResponse.SEARCH_TYPE, searchType)
          )
        ).orderBy(DESC(DowJonesResponse.SEARCH_DATE)).limit(1).select(new ArraySink());
        DowJonesResponse response = sink.getArray().size() > 0 ? (DowJonesResponse) sink.getArray().get(0) : null;
        return response != null ? response.getTotalMatches() : 0;
      `
    },
    {
      name: 'fetchSecureFactSIDniResult',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchId',
          type: 'Long'
        }
      ],
      javaCode: `
        DAO securefactSIDniDAO = (DAO) x.get("securefactSIDniDAO");
        SIDniResponse response = (SIDniResponse) securefactSIDniDAO.find(
          EQ(SIDniResponse.ENTITY_ID, searchId)
        );
        return response != null ? response.getVerified() : false;
      `
    },
    {
      name: 'fetchSecureFactLEVResult',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchId',
          type: 'Long'
        }
      ],
      javaCode: `
        DAO securefactLEVDAO = (DAO) x.get("securefactLEVDAO");
        LEVResponse response = (LEVResponse) securefactLEVDAO.find(
            EQ(LEVResponse.ENTITY_ID, searchId)
        );
        return response != null ? response.hasCloseMatches() : false;
      `
    }
  ]
});
