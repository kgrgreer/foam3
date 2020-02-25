package net.nanopay.tx.cico;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.FileBlob;
import foam.blob.IdentifiedBlob;
import foam.blob.InputStreamBlob;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.fs.File;

import java.io.FileNotFoundException;
import java.io.FileInputStream;
import java.io.InputStream;

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
      Blob data = blobStore.put_(x, new InputStreamBlob(in, fileSize));
      return (File) fileDAO.inX(x).put(new File.Builder(x)
        .setMimeType(mimeType)
        .setFilename(fileName)
        .setFilesize(fileSize)
        .setData(data)
        .build());
    } catch(Throwable t) {
      throw t;
    }
  }

  public static java.io.File getFile(X x, File file) {
    if ( file == null ) return null;

    try {
      IdentifiedBlob ib = (IdentifiedBlob) file.getData();
      FileBlob blob = (FileBlob) ((BlobService) x.get("blobStore")).find(ib.getId());
      if ( blob != null ) return blob.getFile();
    } catch(Throwable t) {
      throw t;
    }
    return null;
  }
}