package net.nanopay.integration.quick;

import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.config.Environment;
import com.intuit.oauth2.config.OAuth2Config;
import foam.core.X;
import net.nanopay.integration.quick.QuickConfig;

public class QuickClientFactory {


	OAuth2PlatformClient client;
	OAuth2Config oauth2Config;

	public void init(X x) {
		// intitialize a single thread executor, this will ensure only one thread processes the queue
    QuickConfig config = (QuickConfig) x.get("quickConfig");
    QuickOauth  auth = (QuickOauth) x.get("quickAuth");

    oauth2Config = new OAuth2Config.OAuth2ConfigBuilder(config.getClientId(), config.getClientSecret()) //set client id, secret
				.callDiscoveryAPI(Environment.SANDBOX) // call discovery API to populate urls
				.buildConfig();
		client  = new OAuth2PlatformClient(oauth2Config);
		auth.setOAuth(client);
		x.put("quickAuth",auth);
	}


	public OAuth2PlatformClient getOAuth2PlatformClient()  {
		return client;
	}

	public OAuth2Config getOAuth2Config()  {
		return oauth2Config;
	}

}
