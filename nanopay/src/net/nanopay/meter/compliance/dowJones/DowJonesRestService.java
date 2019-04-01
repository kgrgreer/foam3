package net.nanopay.meter.compliance.dowJones;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.meter.compliance.dowJones.model.*;

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

/**
 * The DowJonesRestService is used to make a call to the Dow Jones Risk Database
 */

 public class DowJonesRestService
  extends ContextAwareSupport
  {
    public static final String REST_GET = "GET";
    public static final String NAME_SEARCH = "NameSearch";
    public static final String PERSON_NAME_SEARCH = "PersonNameSearch";
    public static final String ENTITY_NAME_SEARCH = "EntityNameSearch";
    public static final String ID_TYPE_SEARCH = "IDTypeSearch";

    public DowJonesResponseMsg serve(DowJonesRequestMsg msg, String RequestInfo) {
      if ( RequestInfo.equals(NAME_SEARCH) ) {
        // return nameSearchService(msg);
        return null;
      } else if ( RequestInfo.equals(PERSON_NAME_SEARCH) ) {
        // return personNameSearchService(msg);
        return null;
      } else if ( RequestInfo.equals(ENTITY_NAME_SEARCH) ) {
        // return entityNameSearchService(msg);
        return null;
      } else if ( RequestInfo.equals(ID_TYPE_SEARCH) ) {
        // return idTypeSearchService(msg);
        return null;
      } else {
        return null;
      }
    }
  }
