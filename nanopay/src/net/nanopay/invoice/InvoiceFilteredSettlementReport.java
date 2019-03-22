package net.nanopay.invoice;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.IdentifiedBlob;
import foam.blob.ProxyBlobService;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.dao.ArraySink;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.DateFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.model.Business;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import static foam.mlang.MLang.*;

  public class InvoiceFilteredSettlementReport extends ProxyBlobService implements WebAgent {
    // This class is for a service, to generate a settlement report(pdf) based on a search field for dates.
    /* Example of Client Side Code to get this service call:
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after a specified invoice
        var inv = await this.invoiceDAO.find(1);
        var sDate = inv.paymentDate.getTime() - (1000*60*60*24*3);
        var dDate = inv.paymentDate.getTime() + (1000*60*60*24*3);
        console.log('sDate = '+sDate+ ' eDate = ' + dDate);
        var url = window.location.origin + "/service/settlementReports?userId=" + this.id + "&startDate="+sDate+"&endDate="+dDate;
        window.location.assign(url);
      */

    public InvoiceFilteredSettlementReport(X x, BlobService delegate) {
      setX(x);
      setDelegate(delegate);
      dated = false;
      dao_ = null;
    }

    protected ArraySink dao_;
    protected boolean dated;
    protected Calendar startDate;
    protected Calendar endDate;

    public void execute(X x) {
      DAO    userDAO           = (DAO) x.get("localUserDAO");
      DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
      Logger logger            = (Logger) x.get("logger");
  
      // PROPERTY SETTING:
      HttpServletRequest req   = x.get(HttpServletRequest.class);
      long id = Integer.parseInt(req.getParameter("userId"));

      if ( id <= 0 ) {
        logger.warning("Error generating settlementReport - business/user Id invalid.");
      }
      try {
        long sT = Long.parseLong(req.getParameter("startDate"));
        long eT = Long.parseLong(req.getParameter("endDate"));
        startDate  = Calendar.getInstance();
        endDate    = Calendar.getInstance();

        startDate.setTimeInMillis(sT);
        endDate.setTimeInMillis(eT);
        dated = true;
      } catch ( Exception e ) { 
        // Integer.parseInt throws java.lang.NumberFormatException
        logger.warning("Error generating settlementReport - passed in date filter error: ", e); 
        dated = false;
      }

      User business = findUser(x,id);
      filterInvoiceDAO(x, business);

      try {
        // create a temporary folder to save files before zipping
        FileUtils.forceMkdir(new File("/opt/nanopay/SettlementReport/"));
  
        File settlementReport = collectInvoiceDataAndWriteToData(x, business);
  
        if ( settlementReport == null ){
          logger.warning("Error generating settlementReport - File null: ");
          return;
        }
  
        downloadZipFile(x, (Business)business, settlementReport);
  
        // delete the temporary folder. Later if we want to archive those files, we can keep the folder.
        FileUtils.deleteDirectory(new File("/opt/nanopay/SettlementReport/"));
      } catch (IOException e) {
        logger.error("Error generating settlementReport: ", e);
      } catch (Throwable t) {
        logger.error("Error generating settlementReport: ", t);
        throw new RuntimeException(t);
      }
    }

    private void filterInvoiceDAO(X x, User user) {
      // Just filters invoiceDAO to the calendar search params or return all relevant invoices
      DAO  invoiceDAO = (DAO) x.get("invoiceDAO");
      if ( dated ) {
        dao_ = (ArraySink) invoiceDAO.where(
          AND(
            NEQ(Invoice.PAYMENT_DATE, null),
            GTE(Invoice.PAYMENT_DATE, startDate.getTime()),
            LTE(Invoice.PAYMENT_DATE, endDate.getTime()),
            OR(
              EQ(Invoice.PAYER_ID, user.getId()),
              EQ(Invoice.PAYEE_ID, user.getId()),
              EQ(Invoice.CREATED_BY, user.getId())
            )
          ))
          .orderBy(new foam.mlang.order.Desc(Invoice.PAYMENT_DATE))
          .select(new ArraySink());
      } else {
        dao_ = (ArraySink) invoiceDAO.orderBy(new foam.mlang.order.Desc(Invoice.PAYMENT_DATE))
          .where(
            AND(
              NEQ(Invoice.PAYMENT_DATE, null),
              OR(
                EQ(Invoice.PAYER_ID, user.getId()),
                EQ(Invoice.PAYEE_ID, user.getId()),
                EQ(Invoice.CREATED_BY, user.getId())
              )
            ))
          .select(new ArraySink());  
      }
    }

    private String getMonthName(int num){
      String month = "wrong";
      DateFormatSymbols dfs = new DateFormatSymbols();
      String[] months = dfs.getMonths();
      if (num >= 0 && num <= 11 ) {
          month = months[num];
      }
      return month;
    }

    private User findUser(X x,long id) {
      DAO  userDAO = (DAO) x.get("userDAO");
      DAO   agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");

      User user = (User) userDAO.find(id);
      Business business;
  
      if ( user instanceof Business ) {
        business = (Business) user;
      } else {
        UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
        business = (Business) userDAO.find(userUserJunction.getTargetId());
      }

      return business;
    }

    private File collectInvoiceDataAndWriteToData(X x, User user) {
      Logger logger = (Logger) x.get("logger");
      String title = "";
      if ( dated ) {
        try {
          title = "Invoice Information for " + startDate.get(Calendar.YEAR) + "-" + getMonthName(startDate.get(Calendar.MONTH)) + "-" + startDate.get(Calendar.DAY_OF_MONTH) + " to " + endDate.get(Calendar.YEAR) + "-" + getMonthName(endDate.get(Calendar.MONTH)) + "-" + endDate.get(Calendar.DAY_OF_MONTH) + "\n for Business ID: " + user.getId() + "\n\n";
        } catch (Exception e) {
          logger.warning("Error generating settlementReport - Error in title", e);
        }
        
      } else {
        title = "All Invoice Information \n for Business ID: " + user.getId() + "\n\n";
      }
  
      String path = "/opt/nanopay/SettlementReport/[" + user.getOrganization() + "]SettlementReport.pdf";
  
      try {
        Document document = new Document();
        PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
        document.open();

        document.add(new Paragraph(title));
  
        List list = createListForOneInvoice(x, user.getOrganization());
  
        document.add(list);
        document.add(Chunk.NEWLINE);
        
        document.close();
        writer.close();
  
        return new File(path);
      } catch (Exception e) {
        logger.error("Error generating settlementReport - writing to document.", e);
      }
      return null; 
    }

    private List createListForOneInvoice(X x, String businessName) {
      DAO  userDAO            = (DAO) x.get("localUserDAO");
      SimpleDateFormat df     = new SimpleDateFormat("yyyy/dd/MM, HH:mm:ss");
      User temp_U             = null;
      String title            = null;
      java.util.List invoiceArray_ = dao_.getArray();
      List list = new List(List.UNORDERED);

      String transDate = "";
      String createdBy_S = "";
      String businessNamePayer = "";
      String businessNamePayee = "";
      String srcCurrency = "";
      String dstCurrency = "";
      String exRate = "";
      String inStatus = "";
      String tanId = "";
      String inORN = "";
      String inID = "";
      String inAmount = "";
      Invoice invoice = null;
      for ( Object temp : invoiceArray_ ) {
        invoice = (Invoice)temp;
        // Format Information variables for each Invoice
        transDate = df.format(invoice.getPaymentDate());
        temp_U = (User) userDAO.find(invoice.getCreatedBy());
        createdBy_S = temp_U == null ? "n/a" : temp_U.label();
        temp_U = (User) userDAO.find(invoice.getPayerId());
        businessNamePayer = temp_U == null ? "n/a" : temp_U.getOrganization();
        temp_U = (User) userDAO.find(invoice.getPayeeId());
        businessNamePayee = temp_U == null ? "n/a" : temp_U.getOrganization();
        srcCurrency = invoice.getSourceCurrency();
        dstCurrency = invoice.getDestinationCurrency();
        exRate = invoice.getExchangeRate() + "";
        inStatus = ((InvoiceStatus)invoice.getStatus()).getLabel();
        tanId = invoice.getReferenceId();
        inORN = invoice.getPurchaseOrder();
        inID = invoice.getId() + "";
        inAmount = invoice.getAmount() + "";

        // Put all variables with text for each line, for write to doc.pdf(settlementReport) 
        list.add(new ListItem("Invoice ID: " + inID + " PO: " + inORN ));
        list.add(new ListItem("\tTransaction Date: " + transDate));
        list.add(new ListItem("\tInvoice was established by: " + createdBy_S));
        list.add(new ListItem("\tPayer: " + businessNamePayer));
        list.add(new ListItem("\tPayee: " + businessNamePayee));
        list.add(new ListItem("\tSource Account Currency Type: " + srcCurrency));
        list.add(new ListItem("\tDestination Account Currency Type: " + dstCurrency));
        if ( exRate != null && exRate.length() != 0 ) {
          list.add(new ListItem("\tExchange Rate: " + exRate));
        }
        list.add(new ListItem("\tStatus of Payment: " + inStatus));
        list.add(new ListItem("\tTransaction ID: " + tanId));
        list.add(new ListItem("\tInvoice Amount: " + inAmount + "\n\n"));
      }
      return list;
    }
    
    private void downloadZipFile(X x, Business business, File file) {
      HttpServletResponse response = x.get(HttpServletResponse.class);
  
      response.setContentType("multipart/form-data");
  
      String businessName = business.getBusinessName();
      String downloadName = "[" + businessName + "]SettlementReport.zip";
  
      response.setHeader("Content-Disposition", "attachment;fileName=\"" + downloadName + "\"");
  
      DataOutputStream os = null;
      ZipOutputStream zipos = null;
      try {
        zipos = new ZipOutputStream(new BufferedOutputStream(response.getOutputStream()));
        zipos.setMethod(ZipOutputStream.DEFLATED);
  
        zipos.putNextEntry(new ZipEntry(file.getName()));
        os = new DataOutputStream(zipos);
        InputStream is = new FileInputStream(file);
        byte[] b = new byte[100];
        int length;
        while((length = is.read(b))!= -1){
          os.write(b, 0, length);
        }
        is.close();
        zipos.closeEntry();
        os.flush();
        
      } catch (Exception e) {
        Logger logger = (Logger) x.get("logger");
        logger.error(e);
      } finally {
        IOUtils.closeQuietly(os);
        IOUtils.closeQuietly(zipos);
      }
    }
}
