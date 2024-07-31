package foam.nanos.analytics.mixpanel;

import com.mixpanel.mixpanelapi.ClientDelivery;
import com.mixpanel.mixpanelapi.MessageBuilder;
import com.mixpanel.mixpanelapi.MixpanelAPI;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.analytics.AnalyticEvent;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.ServiceProvider;
import foam.nanos.auth.User;
import foam.nanos.logger.Loggers;
import foam.nanos.NanoService;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;

import org.json.JSONObject;

public class MixpanelService extends ContextAwareSupport implements NanoService {

  private static final String PROJECT_TOKEN = "2cf01d4604ecf0ba8038c7034fe7851d";
  private static final HashMap<String, HashSet<String>> whitelistCache_ = new HashMap<String, HashSet<String>>();

  public void sendMixpanelEvent(X x, AnalyticEvent event, JSONObject props) {
    if ( ! isWhitelisted(x, event) ) return;
    String trackingId = event.getSessionId();
    MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
    MixpanelAPI mixpanel = new MixpanelAPI();

    JSONObject sentEvent = messageBuilder.event(trackingId, event.getName(), props);

    ClientDelivery delivery = new ClientDelivery();
    delivery.addMessage(sentEvent);
    try {
      mixpanel.deliver(delivery);
    } catch (IOException e) {
      Loggers.logger(x, this).error("Failed sending analyticEvent:", event.getId(), "Can't communicate with Mixpanel");
    }
  }

  public void sendUserProperties(X x, User user, JSONObject props) {

    String trackingId = user.getTrackingId();

    MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
    MixpanelAPI mixpanel = new MixpanelAPI();

    AuthService auth = (AuthService) x.get("auth");
    var isAdmin = user != null
      && (user.getId() == User.SYSTEM_USER_ID
      || user.getGroup().equals("admin")
      || user.getGroup().equals("system"));
    var isAnonymous = user != null && auth.isUserAnonymous(x, user.getId());

    if ( ! isAdmin && ! isAnonymous ) {
      JSONObject updateProfile = messageBuilder.set(trackingId, props);

      try {
        mixpanel.sendMessage(updateProfile);
      } catch (IOException e) {
        Loggers.logger(x, this).error("Failed sending user data:", user.getId(), "Can't communicate with Mixpanel");
      }
    }
  }

  private Boolean isWhitelisted(X x, AnalyticEvent event) {
    var spid = (String) x.get("spid");
    var whitelist = whitelistCache_.get(spid);
    if ( whitelist == null ) {
      var spidObj = (ServiceProvider) ((DAO) x.get("serviceProviderDAO")).find(spid);
      if ( spidObj.getMixpanelWhitelist() == null ) return false;
      whitelist = new HashSet<String>(Arrays.asList(spidObj.getMixpanelWhitelist()));
      whitelistCache_.put(spid, whitelist);
    }
    return whitelist.contains(event.getName());
  }
}
