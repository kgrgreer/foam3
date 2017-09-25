// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class HTTPReplyBox: AbstractFObject, Box {

  lazy var send$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let msg = args[0] as! Message

    
    return try self!.`send`(
        _: msg)
  }
])
      
  }()

  public static let SEND: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "send"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `send`(_ msg: Message) throws {
    
fatalError("unimplemented")
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return HTTPReplyBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return HTTPReplyBox.classInfo_
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


  case "send": return `send$`

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
  
    lazy var id: String = "foam.box.HTTPReplyBox"

    lazy var label: String = "HTTPReply Box"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [SEND]

    lazy var cls: AnyClass = HTTPReplyBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return HTTPReplyBox(args, x)
    }

  }

}