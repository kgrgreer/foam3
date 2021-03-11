/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

package net.nanopay.meter.compliance.secureFact;

import foam.core.X;
import net.nanopay.meter.compliance.secureFact.lev.*;
import net.nanopay.meter.compliance.secureFact.sidni.*;

import java.util.*;

public class SecurefactResponseGenerator {
  public static SecurefactResponse spoofSecurefactResponse(X x, SecurefactRequest request) {
    SecurefactResponse response = new SecurefactResponse.Builder(x).build();

    if ( request instanceof LEVRequest ){
      response = buildLEVResponse(x, (LEVRequest) request);
    }

    if ( request instanceof SIDniRequest ){
      response = buildSIDniResponse(x, (SIDniRequest) request);
    }

    return response;
  }

  private static LEVResponse buildLEVResponse(X x, LEVRequest request){
    Random random = new Random();

    LEVResponse response = new LEVResponse.Builder(x)
      .setSearchId(random.nextInt())
      .setCloseMatches("1/1")
      .setJurisdictionsUnavailable(new String[0])
      .setResults(buildLEVResults(x, request))
      .setId(random.nextLong())
      .setEntityName(request.getEntityName())
      .setStatusCode(200)
      .setRequestJson(buildRequestJSON(x, request))
      .setErrors(new ResponseError[0])
      .build();

    return response;
  }

  private static SIDniResponse buildSIDniResponse(X x, SIDniRequest request){
    Random random = new Random();

    SIDniResponse response = new SIDniResponse.Builder(x)
      .setUserReference(request.getCustomer().getUserReference())
      .setOrderId(request.getCustomer().getCustTransactionId())
      .setIndividualName(request.getName().toString())
      .setVerified(true)
      .setVerifiedSources(new String[0])
      .setDataSources(buildDataSources(x, request))
      .setAdditionalMatchInfo(new SIDniAdditionalMatchInfo[0])
      .setId(random.nextLong())
      .setStatusCode(200)
      .setRequestJson(buildRequestJSON(x, request))
      .setErrors(new ResponseError[0])
      .build();

    return response;
  }

  private static SIDniDataSources[] buildDataSources(X x, SIDniRequest request) {
    Random random = new Random();

    SIDniDataSources[] dataSources = new SIDniDataSources[1];

    SIDniDataSources dataSource = new SIDniDataSources.Builder(x)
      .setVerificationSource("TRANSUNION")
      .setType("CREDIT_FILE")
      .setReference(Long.toString(random.nextLong()))
      .setDate(new Date().toString())
      .setVerifiedNameAndAccount(true)
      .setVerifiedNameAndAddress(true)
      .setVerifiedNameAndDOB(true)
      .setCreditFileAge("N_A")
      .build();

    dataSources[0] = dataSource;

    return dataSources;
  }

  private static LEVResult[] buildLEVResults(X x, LEVRequest request) {
    Random random = new Random();

    LEVResult[] LEVResults = new LEVResult[1];

    LEVIndividualScores individualScore = new LEVIndividualScores.Builder(x)
      .setNameScore("1.0000000000")
      .setJurisdictionScore("1.0000000000")
      .build();

    LEVResult result = new LEVResult.Builder(x)
      .setResultId(random.nextInt())
      .setCloseMatch(true)
      .setConfidenceScore("1.0000000000")
      .setEntityName(request.getEntityName())
      .setEntityType(request.getEntityType())
      .setNormalizedEntityType("Corporation")
      .setEntityStatus("Active")
      .setNormalizedEntityStatus("Active")
      .setExtraProvincial(false)
      .setJurisdiction(request.getJurisdiction())
      .setFormationDate(request.getFormationDate())
      .setEntityNumber(request.getEntityNumber())
      .setNameStatus("Current")
      .setChanges(new LEVChange[0])
      .setIndividualScores(individualScore)
      .build();

    LEVResults[0] = result;

    return LEVResults;
  }

  private static String buildRequestJSON(X x, LEVRequest request) {
    return request.toJSON();
  }

  private static String buildRequestJSON(X x, SIDniRequest request) {
    return request.toJSON();
  }
}
