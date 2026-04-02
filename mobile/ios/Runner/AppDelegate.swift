import Flutter
import UIKit
import UserNotifications

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  private let pushChannelName = "com.getnetbelay.amharaBankMobile/push"
  private var pushChannel: FlutterMethodChannel?
  private var pendingNotificationPayload: [String: Any]?
  private var pushToken: String?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    if let remoteNotification = launchOptions?[.remoteNotification] as? [AnyHashable: Any] {
      pendingNotificationPayload = normalizeNotificationPayload(remoteNotification)
    }

    UNUserNotificationCenter.current().delegate = self
    let finished = super.application(application, didFinishLaunchingWithOptions: launchOptions)

    if let controller = window?.rootViewController as? FlutterViewController {
      configurePushChannel(binaryMessenger: controller.binaryMessenger, application: application)
    }

    return finished
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
  }

  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    let token = deviceToken.map { String(format: "%02x", $0) }.joined()
    pushToken = token.isEmpty ? "ios-simulator" : token
    pushChannel?.invokeMethod("pushTokenUpdated", arguments: pushToken)
  }

  override func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    #if targetEnvironment(simulator)
    pushToken = "ios-simulator"
    #endif
    NSLog("Amhara push registration failed: %@", error.localizedDescription)
  }

  override func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .badge, .sound])
      return
    }

    completionHandler([.alert, .badge, .sound])
  }

  override func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let payload = normalizeNotificationPayload(response.notification.request.content.userInfo)
    if let payload {
      pendingNotificationPayload = payload
      pushChannel?.invokeMethod("notificationTap", arguments: payload)
    }
    completionHandler()
  }

  private func configurePushChannel(
    binaryMessenger: FlutterBinaryMessenger,
    application: UIApplication
  ) {
    let channel = FlutterMethodChannel(name: pushChannelName, binaryMessenger: binaryMessenger)
    pushChannel = channel
    channel.setMethodCallHandler { [weak self] call, result in
      guard let self else {
        result(FlutterError(code: "push_bridge_unavailable", message: "Push bridge unavailable.", details: nil))
        return
      }

      switch call.method {
      case "requestPermissions":
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
          DispatchQueue.main.async {
            if let error {
              result(
                FlutterError(
                  code: "push_permission_failed",
                  message: error.localizedDescription,
                  details: nil
                )
              )
              return
            }

            if granted {
              application.registerForRemoteNotifications()
            }

            result(granted)
          }
        }
      case "getPushToken":
        #if targetEnvironment(simulator)
        result(self.pushToken ?? "ios-simulator")
        #else
        result(self.pushToken)
        #endif
      case "consumeLaunchNotification":
        let payload = self.pendingNotificationPayload
        self.pendingNotificationPayload = nil
        result(payload)
      default:
        result(FlutterMethodNotImplemented)
      }
    }
  }

  private func normalizeNotificationPayload(_ userInfo: [AnyHashable: Any]) -> [String: Any]? {
    var payload: [String: Any] = [:]

    if let deepLink = userInfo["deepLink"] as? String, !deepLink.isEmpty {
      payload["deepLink"] = deepLink
    }

    if let notificationId = userInfo["notificationId"] as? String, !notificationId.isEmpty {
      payload["notificationId"] = notificationId
    }

    if let data = userInfo["notificationData"] as? [String: Any], !data.isEmpty {
      payload["notificationData"] = data
    }

    return payload.isEmpty ? nil : payload
  }
}
