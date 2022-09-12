/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.servlet;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.InputStreamBlob;
import foam.core.X;
import foam.core.XLocator;
import foam.core.ProxyX;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import org.apache.commons.text.StringEscapeUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.TranscoderException;

/**
   Image lookup assumes images are places at the root of the jar file.
   During build, generally output/copied to classes/
   HTTPServlet setups the resourcebase using webroot, but so far that
   setup requires explicit knowledge of the webroot folder name, which
   needs to be prepended to the request.
*/
public class ResourceImageServlet
  extends ImageServlet
{
  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException
  {
    String request = req.getRequestURI();
    //System.out.println("ResourceImageServlet.service uri: "+req.getRequestURI());

    InputStream is = getClass().getResourceAsStream(request);
    if ( is != null ) {
      String ext = EXTS.get(request.substring(request.lastIndexOf('.') +1));
      try ( BufferedInputStream bis = new BufferedInputStream(is) ) {
        resp.setContentType(!SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
        resp.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day

        IOUtils.copy(bis, resp.getOutputStream());
        return;
      }
    // } else {
    //  System.out.println("ResourceImageServlet.service '"+request+"' not found.");
    } else if ( request.endsWith(".png") ) {
      // Make sure that the png file exists

      X x = ((X) XLocator.get()).getX(); //this.getServletConfig().getServletContext().getAttribute("X")
      DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
      String fileName = request.substring(request.lastIndexOf("/") + 1);

      File file = (File) fileDAO.find(fileName);

      if ( file != null ) {
        // return this file in request
        InputStream tempIS = new FileInputStream(file);
        String ext = EXTS.get(request.substring(request.lastIndexOf('.') +1)); //png
        try ( BufferedInputStream bis = new BufferedInputStream(tempIS) ) {
          resp.setContentType(!SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
          resp.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day

          IOUtils.copy(bis, resp.getOutputStream());
          return;
        }
      } else {
        String imageSvg = request.replaceFirst("\\.png", ".svg");
        InputStream isSvg = getClass().getResourceAsStream(imageSvg);

        // convert svg requested file to png and put it to fileDAO
        TranscoderInput inputSvgImage = new TranscoderInput(isSvg);
        try ( OutputStream pngOutputStream = new ByteArrayOutputStream() ) {
          TranscoderOutput outputPngImage  = new TranscoderOutput(pngOutputStream);
          PNGTranscoder    myConverter     = new PNGTranscoder();
          myConverter.transcode(inputSvgImage, outputPngImage);

          // BlobService blobStore  = (BlobService) x.get("blobStore");
          Blob data = new InputStreamBlob(pngOutputStream, ((ByteArrayOutputStream) pngOutputStream).size());
          foam.nanos.fs.File file = new foam.nanos.fs.File.Builder(x)
            .setMimeType(mimeType)
            .setFilename(fileName)
            .setFilesize(fileSize)
            .setData(data)
            .setSpid(spid)
            .build();

          pngOutputStream.flush();
        } catch ( TranscoderException e ) {
          ((Logger) x.get("logger")).error(e);
        }
      }
    }
    resp.sendError(resp.SC_NOT_FOUND);
  }
}
