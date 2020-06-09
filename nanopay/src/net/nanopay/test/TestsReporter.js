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
  package: 'net.nanopay.test',
  name: 'TestsReporter',
  documentation: 'Reports the total number of tests written to a Slack channel.',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.test.Test',
    'foam.nanos.notification.Notification',

    'java.util.*',

    'net.nanopay.test.TestReport'
  ],

  methods: [
    {
      name: 'generateNewReport',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaCode: `
long lastReport = getLastReport(x);

DAO testDAO = (DAO) x.get("testDAO");
ArraySink tests = (ArraySink) testDAO.select(new ArraySink());
List testArray = tests.getArray();

long totalTests = 0;
for(Test test : (List<Test>) testArray){
  totalTests += test.getPassed() + test.getFailed();
}

DAO reportsDAO = (DAO) x.get("testReportDAO");
TestReport newReport = new TestReport.Builder(x)
  .setTime(new Date())
  .setTotalTests(totalTests)
  .build();
reportsDAO.put(newReport);

pushNotification(x, lastReport, totalTests);`
    },
    {
      name: 'getLastReport',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Long',
      javaCode: `
DAO reportsDAO = (DAO) x.get("testReportDAO");
ArraySink reports = (ArraySink) reportsDAO.select(new ArraySink());
List reportArray = reports.getArray();

if(reportArray.isEmpty()){
  return 0;
} else {
  TestReport report = (TestReport) reportArray.get(reportArray.size() - 1);
  return report.getTotalTests();
}`
    },
    {
      name: 'pushNotification',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'lastReport', type: 'Long'
        },
        {
          name: 'totalTests', type: 'Long'
        }
      ],
      type: 'Void',
      javaCode: `
        String body = "=====Tests Summary=====\\n";
        if(totalTests == lastReport){
          body += "_No tests were added or removed._\\n";
        } else if (totalTests < lastReport){
          body += "*Tests Removed:* " + String.valueOf(lastReport - totalTests) + "\\n";
        } else {
          body += "*Tests Added:* " + String.valueOf(totalTests - lastReport) + "\\n";
        }
        body += "*Total Tests:* " + String.valueOf(totalTests);

        Notification notification = new Notification.Builder(x)
          .setTemplate("TestsReporter")
          .setBody(body)
          .build();
        DAO notificationDAO = (DAO) x.get("localNotificationDAO");
        notificationDAO.put(notification);`
    }
  ]
});
