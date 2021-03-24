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
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'SecurefactService',

  documentation: `Securefact service which communicates with SIDni and LEV APIs
    for individual identity verification and business entity search.`,

  imports: [
    'DAO securefactResponseDAO?'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.AndPropertyPredicate',
    'foam.lib.NetworkPropertyPredicate',
    'foam.lib.PermissionedPropertyPredicate',
    'foam.lib.PropertyPredicate',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.Arrays',
    'java.util.Base64',
    'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataResponse',
    'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentOrderResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResult',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
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
      name: 'levDocumentOrderUrl',
      label: 'LEV DOCUMENT ORDER URL'
    },
    {
      class: 'String',
      name: 'levDocumentDataUrl',
      label: 'LEV DOCUMENT DATA URL'
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
      type: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
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
        var pm = new PM(SecurefactService.getOwnClassInfo().getId(), "sidniVerify");
        try {
          SecurefactRequest request = SecurefactRequestGenerator.getSIDniRequest(x, user);
          request.setUrl(getSidniUrl());
          request.setAuthKey(getSidniApiKey());

          SIDniResponse response = (SIDniResponse) sendRequest(x, request, SIDniResponse.class);
          response.setEntityName(user.getLegalName());
          response.setEntityId(user.getId());
          return (SIDniResponse)
            ((DAO) getSecurefactResponseDAO()).put(response);
        } catch (Throwable t) {
          pm.error(x, t.getMessage());
          throw t;
        } finally {
          pm.log(x);
        }
      `
    },
    {
      name: 'levSearch',
      type: 'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
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
        var pm = new PM(SecurefactService.getOwnClassInfo().getId(), "levSearch");
        try {
          SecurefactRequest request = SecurefactRequestGenerator.getLEVRequest(x, business);
          request.setUrl(getLevUrl());
          request.setAuthKey(getLevApiKey());
  
          LEVResponse response = (LEVResponse) sendRequest(x, request, LEVResponse.class);
          response.setEntityName(business.getOrganization());
          response.setEntityId(business.getId());
          // Aggregate close matches
          String region = business.getAddress().getRegionId();
          LEVResult[] results = response.getResults();
          long closeMatchCounter = Arrays.stream(results).filter(
            o -> o.getCloseMatch() && o.getJurisdiction().equals(region)
          ).count();
          response.setCloseMatches(closeMatchCounter + "/" + results.length);
          return (LEVResponse)
            ((DAO) getSecurefactResponseDAO()).put(response);
        } catch (Throwable t) {
          pm.error(x, t.getMessage());
          throw t;
        } finally {
          pm.log(x);
        }
      `
    },
    {
      name: 'levDocumentOrder',
      type: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentOrderResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'resultId',
          type: 'int'
        }
      ],
      javaCode: `
        var pm = new PM(SecurefactService.getOwnClassInfo().getId(), "levDocumentOrder");
        try {
          SecurefactRequest request = SecurefactRequestGenerator.getLEVDocumentOrderRequest(resultId);
          request.setUrl(getLevDocumentOrderUrl());
          request.setAuthKey(getLevApiKey());
          LEVDocumentOrderResponse response = (LEVDocumentOrderResponse) sendRequest(x, request, LEVDocumentOrderResponse.class);
          return (LEVDocumentOrderResponse)
            ((DAO) getSecurefactResponseDAO()).put(response);
        } catch (Throwable t) {
          pm.error(x, t.getMessage());
          throw t;
        } finally {
          pm.log(x);
        }
      `
    },
    {
      name: 'levDocumentData',
      type: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'orderId',
          type: 'int'
        }
      ],
      javaCode: `
        var pm = new PM(SecurefactService.getOwnClassInfo().getId(), "levDocumentData");
        try {
          SecurefactRequest request = SecurefactRequestGenerator.getLEVDocumentDataRequest(orderId);
          request.setUrl(getLevDocumentDataUrl());
          request.setAuthKey(getLevApiKey());
          LEVDocumentDataResponse response = (LEVDocumentDataResponse) sendRequest(x, request, LEVDocumentDataResponse.class);
          return (LEVDocumentDataResponse)
            ((DAO) getSecurefactResponseDAO()).put(response);
        } catch (Throwable t) {
          pm.error(x, t.getMessage());
          throw t;
        } finally {
          pm.log(x);
        }
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
          Outputter jsonOutputter = new Outputter(x).setPropertyPredicate(new AndPropertyPredicate(x, new PropertyPredicate[] {new NetworkPropertyPredicate(), new PermissionedPropertyPredicate()})).setOutputClassNames(false);
          String requestJson = jsonOutputter.stringify(request);
          StringEntity entity = new StringEntity(requestJson);
          entity.setContentType("application/json");

          String basicAuth = request.getAuthKey() + ":";
          httpPost.addHeader("Content-type", "application/json");
          httpPost.addHeader("Authorization", "Basic " +
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
          response.setRequestJson(requestJson);
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
