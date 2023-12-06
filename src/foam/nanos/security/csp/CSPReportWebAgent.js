/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.security.csp',
  name: 'CSPReportWebAgent',

  documentation: 'Service that fetches all of the incoming CSP Violation reports.',

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.nanos.logger.Loggers',
    'foam.net.IPSupport',
    'java.io.BufferedReader',
    'java.io.IOException',
    'java.io.UnsupportedEncodingException',
    'java.util.Date',
    'javax.servlet.http.HttpServletRequest',

  ],

  methods: [
    {
      name: 'execute',
      args: 'Context x',
      javaCode:`
        var logger = Loggers.logger(x, this);
        var req    = x.get(HttpServletRequest.class);
        var dao    = (DAO) x.get("CSPViolationsDAO");

        var report = new CSPViolation();
        report.setDate(new Date(System.currentTimeMillis()));
        report.setIp(IPSupport.instance().getRemoteIp(x));

        var sb = new StringBuilder();
        try {
          String line = null;
          BufferedReader reader = req.getReader();
          while ( (line = reader.readLine()) != null )
            sb.append(line);
        } catch ( UnsupportedEncodingException e ) {
          logger.error("CSPReportWebAgent :: Header contains unsupported character set encoding.");
          return;
        } catch ( IOException e ) {
          logger.error("CSPReportWebAgent :: Cannot read HTTP header.");
          return;
        } catch ( IllegalStateException e ) {
          logger.error("CSPReportWebAgent :: GetReader has already been called once.");
          return;
        }

        var jsonParser = new JSONParser();
        jsonParser.setX(x);

        var payload = (CSPReportPayload) jsonParser.parseString(sb.toString(), CSPReportPayload.class);
        if ( payload != null && payload.getCSPReport() != null ) {
          report.copyFrom(payload.getCSPReport());
          dao.put(report);
          logger.info("CSPReportWebAgent :: New CSP violation reported");
        } else {
          logger.warning("CSPReportWebAgent :: Unrecognized CSP violation payload", sb.toString());
        }
      `
    }
  ]
});
