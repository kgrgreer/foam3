package net.nanopay.fx.ascendantfx;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import foam.core.X;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgent;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class AscendantFXReportsWebAgent implements WebAgent {

  @Override
  public void execute(X x) {
    HttpServletRequest req     = x.get(HttpServletRequest.class);

    String userId = req.getParameter("userId");
    System.out.println("id:" + userId);


    generateAFXPDF(x);
  }

  private void generateAFXPDF(X x) {

    try {
       System.out.println(111);

      String msg = "your message";



      ByteArrayOutputStream baos = new ByteArrayOutputStream();

      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, baos);

      document.open();
      document.add(new Paragraph("Company Information"));
      document.close();

      writer.close();

      HttpServletResponse response = x.get(HttpServletResponse.class);

      response.setContentType("application/pdf");
      response.setHeader("Content-disposition", "attachment; filename=\"testaaaaa");

      ServletOutputStream out = response.getOutputStream();
      baos.writeTo(out);
      out.flush();


    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }
  }
}
