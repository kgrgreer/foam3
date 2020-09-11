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
   package: 'net.nanopay.meter.compliance.secureFact',
   name: 'SecurefactOnboardingDAO',
   extends: 'foam.dao.ProxyDAO',

   documentation: `Decorating DAO for Securefact business onboarding through FlinksLoginId requests.`,

   javaImports: [
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User',
     'foam.nanos.logger.Logger',
     'net.nanopay.flinks.external.FlinksLoginId',
     'net.nanopay.meter.compliance.secureFact.SecurefactService',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResult',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentOrderResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentParty',
     'net.nanopay.model.Business'
   ],

   methods: [
     {
       name: 'put_',
       javaCode: `
        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;
        DAO businessDAO = (DAO) x.get("localBusinessDAO");
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        Business business = flinksLoginId.findBusiness(x);

        if ( business == null ) {
          User user = flinksLoginId.findUser(x);
          if (user == null) {
            user = ((Subject) x.get("subject")).getUser();
          }
          business = (Business) businessDAO.find(user.getId());
        }

        try {
          LEVResponse response = securefactService.levSearch(x, business);
          LEVResult[] results = response.getResults();
          LEVResult chosenResult = null;
          for ( int i = 0; i < results.length; i++ ) {
            LEVResult result = results[i];
            if ( result.getCloseMatch() == true ) {
              chosenResult = result;
              break;
            }
          }

          if ( chosenResult != null ) {
            LEVDocumentOrderResponse orderResponse = securefactService.levDocumentOrder(x, chosenResult.getResultId());
            LEVDocumentDataResponse dataResponse = securefactService.levDocumentData(x, orderResponse.getOrderId());
            LEVDocumentParty[] parties = dataResponse.getParties();
          }
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("SecurefactOnboardingDAO failed.", e);
        }
        
        return super.put_(x, flinksLoginId);
       `
     }
   ]
 });
