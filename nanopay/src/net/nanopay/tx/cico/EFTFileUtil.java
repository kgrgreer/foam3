package net.nanopay.tx.cico;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.FileBlob;
import foam.blob.IdentifiedBlob;
import foam.blob.InputStreamBlob;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Base64;

import org.apache.commons.io.IOUtils;

public class EFTFileUtil {

  public static File storeEFTFile(X x, java.io.File file, String mimeType) throws FileNotFoundException {
    try {
      FileInputStream in = new FileInputStream(file);
      return storeEFTFile(x, in, file.getName(), Long.valueOf(file.length()), mimeType);
    } catch(Throwable t) {
      throw t;
    }
  }

  public static File storeEFTFile(X x, java.io.File file, String fileName, String mimeType) throws FileNotFoundException {
    try {
      FileInputStream in = new FileInputStream(file);
      return storeEFTFile(x, in, fileName, Long.valueOf(file.length()), mimeType);
    } catch(Throwable t) {
      throw t;
    }
  }

  public static File storeEFTFile(X x, InputStream in, String fileName, Long fileSize, String mimeType) {
    try {
      DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
      BlobService blobStore  = (BlobService) x.get("blobStore");
      File file = null;
      if ( fileSize > 3 * 1024 * 1024 ){
        Blob data = blobStore.put_(x, new InputStreamBlob(in, fileSize));
        file = new File.Builder(x)
          .setMimeType(mimeType)
          .setFilename(fileName)
          .setFilesize(fileSize)
          .setData(data)
          .build();
      } else {
        try {
          String base64 = Base64.getEncoder().encodeToString(IOUtils.toByteArray(in));
          String fileExtension = "";
          if ( fileName.lastIndexOf(".") != -1 && fileName.lastIndexOf(".") != 0)
            fileExtension = fileName.substring(fileName.lastIndexOf(".")+1);
          String data = "data:/" + fileExtension +";base64," + base64;
          file = new File.Builder(x)
            .setMimeType(mimeType)
            .setFilename(fileName)
            .setFilesize(fileSize)
            .setDataString(data)
            .build();
        } catch(IOException t) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(t);
        }
      }
      return (File) fileDAO.inX(x).put(file);
    } catch(Throwable t) {
      throw t;
    }
  }

  public static java.io.File getFile(X x, File file) {
    if ( file == null ) return null;

    try {
      if ( SafetyUtil.isEmpty(file.getDataString()) ){
        IdentifiedBlob ib = (IdentifiedBlob) file.getData();
        FileBlob blob = (FileBlob) ((BlobService) x.get("blobStore")).find(ib.getId());
        if ( blob != null ) return blob.getFile();
      } else {
        try {
          InputStreamBlob blob = (InputStreamBlob) file.getData();
          InputStream inputStream = (ByteArrayInputStream) blob.getInputStream();
          byte[] byteArray = new byte[inputStream.available()];
          inputStream.read(byteArray);
          java.io.File tempFile = java.io.File.createTempFile(file.getFilename(), file.getMimeType());
          FileOutputStream fos = new FileOutputStream(tempFile);
          fos.write(byteArray);
          return tempFile;
        } catch(IOException t) {
          Logger logger = (Logger) x.get("logger");
          logger.warning(t);
        }
      }
    } catch(Throwable t) {
      throw t;
    }
    return null;
  }
}
