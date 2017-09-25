// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class InvalidMessageException: AbstractFObject, Error {

  public var messageType: Any? {
    get {
      
if _messageType_inited_ {
  return _messageType_
}

return nil

      
    }
set(value) {
      
self.set(key: "messageType", value: value)
      
    }
  }

  var _messageType_: Any? = nil

  var _messageType_inited_: Bool = false

  public static let MESSAGE_TYPE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "messageType"
  let classInfo: ClassInfo
  let transient = false
  let label = "Message Type" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var messageType_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "messageType",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var messageType_Value_Sub_: Subscription?

  public var messageType$: Slot {
    get {
      return self.messageType_Value_
    }
set(value) {
      
self.messageType_Value_Sub_?.detach()
self.messageType_Value_Sub_ = self.messageType$.linkFrom(value)
self.onDetach(self.messageType_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_messageType_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_messageType_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_messageType_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return InvalidMessageException.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return InvalidMessageException.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "messageType":
    _messageType_inited_ = false
    _messageType_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "messageType"]) {
      _ = pub(["propertyChange", "messageType", messageType$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "messageType": return `_messageType_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "messageType": return `messageType`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "messageType": return `messageType$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "messageType$":
    messageType$ = value as! Slot
    return
  case "messageType":
  
    let oldValue: Any? = _messageType_inited_ ? self.`messageType` : nil
    _messageType_ = _messageType_preSet_(oldValue, _messageType_adapt_(oldValue, value))
    _messageType_inited_ = true
    _messageType_postSet_(oldValue, _messageType_)
    if hasListeners(["propertyChange", "messageType"]) && !FOAM_utils.equals(oldValue, _messageType_) {
      _ = pub(["propertyChange", "messageType", messageType$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.InvalidMessageException"

    lazy var label: String = "Invalid Message Exception"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [MESSAGE_TYPE]

    lazy var cls: AnyClass = InvalidMessageException.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return InvalidMessageException(args, x)
    }

  }

}