// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class HTTPBoxOutputter: Outputter {

  public var me: Any? {
    get {
      
return __context__["me"]
      
    }
set(value) {
      
self.me$?.swiftSet(value)
      
    }
  }

  public var me$: Slot? {
    get {
      
return __context__["me$"] as? Slot ?? nil
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `HTTPReplyBox_create`(_ args: [String:Any?] = [:]) -> HTTPReplyBox {
    
return __subContext__.create(HTTPReplyBox.self, args: args)!
      
  }

  public override func `output`(_ out: inout String, _ data: Any?) {
    
super.output(&out, (me as? AnyObject) === (data as? AnyObject) ?
    HTTPReplyBox_create() : data)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return HTTPBoxOutputter.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return HTTPBoxOutputter.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.output.HTTPBoxOutputter"

    lazy var label: String = "HTTPBox Outputter"

    lazy var parent: ClassInfo? = Outputter.classInfo()

    lazy var ownAxioms: [Axiom] = [OUTPUT]

    lazy var cls: AnyClass = HTTPBoxOutputter.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return HTTPBoxOutputter(args, x)
    }

  }

}