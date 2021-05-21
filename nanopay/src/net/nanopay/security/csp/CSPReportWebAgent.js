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
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',

    'javax.servlet.http.HttpServletRequest',

    'java.io.BufferedReader',
    'java.io.IOException',
    'java.io.UnsupportedEncodingException',
    'java.util.Date',

    'net.nanopay.security.csp.CSPViolationReport',

    'com.google.gson.Gson',
    'com.google.gson.JsonSyntaxException'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `private static final Gson GSON = new Gson();`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode:
`Logger logger  = (Logger) x.get("logger");
HttpServletRequest req = x.get(HttpServletRequest.class);
BufferedReader reader = null;
DAO CSPViolationsDAO = (DAO) getX().get("CSPViolationsDAO");
CSPViolation report = new CSPViolation();

report.setDate(new Date(System.currentTimeMillis()));
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
  CSPViolationReport CSPReport = GSON.fromJson(sb.toString(), CSPViolationReport.class);

  report.setBlockedURI(CSPReport.getCSPReport().getBlockedUri());
  report.setDisposition(CSPReport.getCSPReport().getDisposition());
  report.setDocumentURI(CSPReport.getCSPReport().getDocumentUri());
  report.setEffectiveDirective(CSPReport.getCSPReport().getEffectiveDirective());
  report.setOriginalPolicy(CSPReport.getCSPReport().getOriginalPolicy());
  report.setReferrer(CSPReport.getCSPReport().getReferrer());
  report.setScriptSample(CSPReport.getCSPReport().getScriptSample());
  report.setStatusCode(CSPReport.getCSPReport().getStatusCode());
  report.setViolatedDirective(CSPReport.getCSPReport().getViolatedDirective());
  report.setSourceFile(CSPReport.getCSPReport().getSourceFile());
  report.setLineNumber(CSPReport.getCSPReport().getLineNumber());
  report.setColumnNumber(CSPReport.getCSPReport().getColumnNumber());
} catch (JsonSyntaxException e) {
  logger.error("CSPReportWebAgent :: Error parsing JSON request string.");
  return;
}

CSPViolationsDAO.put(report);
logger.info("CSPReportWebAgent :: New CSP violation reported");
`
    }
  ]
});
