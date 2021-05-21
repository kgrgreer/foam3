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
  package: 'net.nanopay.security.pii',
  name: 'PIIReportGenerator',
  implements: [
    'net.nanopay.security.pii.PII'
  ],
  documentation: 'handles User PII (personally identifiable information) reporting and requests',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'java.util.ArrayList',
    'java.util.Date'
  ],

  imports: [
    'userDAO',
    'viewPIIRequestDAO',
    'user'
  ],

  methods: [
    {
      name: 'getPIIData',
      documentation: `return a JSON Object with keys as User property which are flagged as containing PII,
      and values as the values of those properties for the user`,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          class: 'Long'
        }
      ],
      type: 'String',
      javaCode:
        `
  DAO userDAO = (DAO) x.get("userDAO");
  User user = (User) userDAO.find_(x, id );
  PIIOutputter piiOutputter = new PIIOutputter(x);
  return (piiOutputter.stringify(user));
      `
    },
    {
      name: 'addTimeToPIIRequest',
      documentation: `clones a PIIRequest and adds the current date to the DownloadedAt Array and puts
      it back to the dao `,
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        DAO vprDAO = (DAO) x.get("viewPIIRequestDAO");
        User user = ((Subject) x.get("subject")).getUser();

        // get valid PII request object for current user
        ViewPIIRequest request = (ViewPIIRequest) vprDAO.inX(x)
          .find(MLang.AND(
            MLang.EQ(ViewPIIRequest.CREATED_BY, user.getId() ),
            MLang.EQ(ViewPIIRequest.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
            MLang.GT(ViewPIIRequest.REQUEST_EXPIRES_AT , new Date() )
          ));

        // Clone object and append current dateTime to its DownloadedAt array prop
        ViewPIIRequest clonedRequest = (ViewPIIRequest) request.fclone();
        ArrayList cloneDownloadedAt =  clonedRequest.getDownloadedAt();
        cloneDownloadedAt.add(new Date());

        // Update the clonedRequest and put to DAO
        clonedRequest.setProperty("downloadedAt", (Object) cloneDownloadedAt);
        vprDAO.put(clonedRequest);
      `
    }
  ],
});
