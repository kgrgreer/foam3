package net.nanopay.meter.test;

import foam.core.X;
import foam.nanos.test.Test;
import net.nanopay.meter.compliance.dowJones.DowJonesCredentials;
import net.nanopay.meter.compliance.dowJones.DowJonesService;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.Calendar;
import java.util.Date;

// apache
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.commons.io.IOUtils;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.client.config.RequestConfig;

public class DowJonesIntegrationTest extends Test {

  @Override
  public void runTest(X x) {
    DowJonesCredentials credentials = (DowJonesCredentials) x.get("dowjonesCredentials");
    DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");

    String authCredentials = credentials.getNamespace() + "/" + credentials.getUsername() + ":" + credentials.getPassword();
    String encodedCredentials = Base64.getEncoder().encodeToString((authCredentials).getBytes());

    String firstName = "Blake";
    String lastName = "Green";

    String entityName = "Apothecary";


    // Prints out response data of personNameSearch and entityNameSearch from DowJonesService
    System.out.println(dowJonesService.personNameSearch(x, firstName, lastName, null));
    System.out.println(dowJonesService.entityNameSearch(x, entityName, null));
  }
  
}