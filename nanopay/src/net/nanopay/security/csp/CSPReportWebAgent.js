foam.CLASS({
  package: 'net.nanopay.security.csp',
  name: 'CSPReportWebAgent',

  documentation: `Service that fetches all of the incoming CSP Violation
    reports.`,

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  imports: [
    'CSPViolationsDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',

    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse',

    'java.io.BufferedReader',
    'java.io.IOException',
    'java.io.UnsupportedEncodingException',
    'java.util.UUID',
    'java.util.Date',

    'org.json.*',

    'com.fasterxml.uuid.*'
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode:
`Logger logger  = (Logger) x.get("logger");
HttpServletRequest req = x.get(HttpServletRequest.class);
BufferedReader reader = null;
DAO CSPViolationsDAO = (DAO) getX().get("CSPViolationsDAO");
CSPViolationReport report = new CSPViolationReport();
NoArgGenerator timeBasedGenerator = Generators.timeBasedGenerator();
UUID uuid = timeBasedGenerator.generate();

report.setUuid(uuid.toString());
//Convert from ns to ms; then rebase from 1582-10-15 to 1970-01-01.
report.setDate(new Date(((uuid.timestamp() / 10000L) + 12219292800L)));
report.setIp(req.getRemoteAddr());

StringBuffer sb = new StringBuffer();
String line = null;
try {
  reader = req.getReader();
  while ((line = reader.readLine()) != null)
    sb.append(line);
} catch (UnsupportedEncodingException e) {
  logger.error("CSPReportWebAgent :: Header contains unsupported character set encoding.");
  return;
} catch (IOException e) {
  logger.error("CSPReportWebAgent :: Cannot read HTTP header.");
  return;
} catch (IllegalStateException e) {
  logger.error("CSPReportWebAgent :: GetReader has already been called once.");
  return;
}

try {
  JSONObject data =  new JSONObject(sb.toString());
  JSONObject CSPReport = (JSONObject) data.get("csp-report");

  for( String name : JSONObject.getNames(CSPReport) ){
    switch ( name ) {
      case "blocked-uri":
        report.setBlockedURI(CSPReport.getString(name));
        break;
      case "disposition":
        report.setDisposition(CSPReport.getString(name));
        break;
      case "document-uri":
        report.setDocumentURI(CSPReport.getString(name));
        break;
      case "effective-directive":
        report.setEffectiveDirective(CSPReport.getString(name));
        break;
      case "original-policy":
        report.setOriginalPolicy(CSPReport.getString(name));
        break;
      case "referrer":
        report.setReferrer(CSPReport.getString(name));
        break;
      case "script-sample":
        report.setScriptSample(CSPReport.getString(name));
        break;
      case "status-code":
        report.setStatusCode(CSPReport.getString(name));
        break;
      case "violated-directive":
        report.setViolatedDirective(CSPReport.getString(name));
        break;
      default:
        logger.warning("CSPReportWebAgent : " + name + " : Invalid field in CSPReport.");
        break;
    }
  }
} catch (JSONException e) {
  logger.error("CSPReportWebAgent :: Error parsing JSON request string.");
  return;
}

CSPViolationsDAO.put(report);
logger.info("CSPReportWebAgent :: New CSP violation reported");
`
    }
  ]
});
