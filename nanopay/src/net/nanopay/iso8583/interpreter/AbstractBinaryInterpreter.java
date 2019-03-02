package net.nanopay.iso8583.interpreter;

/**
 * AbstractBinaryInterpreter class with helper readBytes method
 */
public abstract class AbstractBinaryInterpreter
  implements BinaryInterpreter
{
  protected byte[] readBytes(java.io.InputStream in, int length)
    throws java.io.IOException
  {
    int n = 0;
    byte[] b = new byte[length];

    while ( n < length ) {
      int count = in.read(b, n, length - n);
      if ( count < 0 ) {
        throw new java.io.EOFException();
      }
      n += count;
    }

    return b;
  }
}
