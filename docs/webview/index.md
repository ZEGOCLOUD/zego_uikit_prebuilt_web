## 方案概览

webview可以让你在移动应用中打开web应用，获得类似原生应用的体验； 做到一次开发，多端适配，并能获得web一样在线实时更新的能力；

WebRTC 比一 般Web 应用需要额外获得摄像头，麦克风等使用权限，因此Webview也需要做一些额外适配，阅读 本文可以帮助你在安卓，ios平台，以及flutter框架下快速搭建 WebRTC 应用

## 安卓平台配置

本教程使用的是kotlin开发，java 除语法有稍微差别，配置一样

#### 创建项目

我们使用 [Android Studio](https://developer.android.com/studio?gclid=Cj0KCQjwidSWBhDdARIsAIoTVb15LyZh4Pc89pQ8F9MoN8TJoHVjGh9xR1S42OvEUdPKpnRT67RrXmYaAtZ2EALw_wcB&gclsrc=aw.ds) 创建一个空白项目

* 打开Android Studio 点击 New Project, 选择 **Empty Activity** ，点击next 按钮
  ![config](../webview/android_kt_create_s1.jpeg)
* 我们这里给项目取名为 myWebviewWebRTC , 点击 Finish 按钮完成创建项目
  ![config](../webview/android_kt_create_s2.jpeg)

#### 代码实现

创建项目完成后，我们需要创建 webview ，并打开我们的Web应用，这里以 ZEGOCLOUD Web CallKits 为例, 根据是否需要白板图片上传功能，下面的步骤1和2 您只需要关注一个就可以；

1. 复制以下代码到项目的 MainActivity.kt 文件中 （不需要白板图片上传功能）

   ```kotlin

   package com.example.myapplication

   import android.Manifest
   import android.annotation.TargetApi
   import android.app.Activity
   import android.content.Intent
   import android.content.pm.PackageManager
   import android.net.Uri
   import android.os.Build
   import android.os.Bundle
   import android.webkit.PermissionRequest
   import android.webkit.ValueCallback
   import android.webkit.WebChromeClient
   import android.webkit.WebView
   import androidx.appcompat.app.AppCompatActivity
   import androidx.core.app.ActivityCompat
   import com.example.mywebviewwebrtc.R

   class MainActivity : AppCompatActivity() {

       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           setContentView(R.layout.activity_main)


           //创建WebView实例，并配置webrtc应用所需要权限
           val WebView: WebView = findViewById(R.id.webview)
           WebView.settings.javaScriptEnabled = true
           WebView.settings.domStorageEnabled = true
           WebView.settings.allowFileAccess = true
           WebView.settings.allowContentAccess = true
           WebView.setWebChromeClient(object : WebChromeClient() {
               override fun onPermissionRequest(request: PermissionRequest) {
                   request.grant(request.resources)
               }  
           })

          // 加载webrtc应用地址
   WebView.loadUrl("https://zegocloud.github.io/zego_uikit_prebuilt_web/video_conference/index.html?roomID=zegocloud&role=Host?roomID=zegocloud&role=Host")

           // 检查用户是否授权必须权限
           if (!isPermissionGranted()) {
               askPermissions()
           }
       }

       private val permission = arrayOf(
           Manifest.permission.CAMERA,
           Manifest.permission.RECORD_AUDIO,
           Manifest.permission.MODIFY_AUDIO_SETTINGS)

       private val requestCode = 1

       private fun isPermissionGranted(): Boolean {
           permission.forEach {
               if (ActivityCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED)
                   return false
           }

           return true
       }

       private fun askPermissions() {
           ActivityCompat.requestPermissions(this, permission, requestCode)
       }
   }
   ```
2. 复制以下代码到项目的 MainActivity.kt 文件中（需要白板图片上传功能）

   ```kotlin
   package com.example.myapplication

   import android.Manifest
   import android.annotation.TargetApi
   import android.app.Activity
   import android.content.Intent
   import android.content.pm.PackageManager
   import android.net.Uri
   import android.os.Build
   import android.os.Bundle
   import android.webkit.PermissionRequest
   import android.webkit.ValueCallback
   import android.webkit.WebChromeClient
   import android.webkit.WebView
   import androidx.appcompat.app.AppCompatActivity
   import androidx.core.app.ActivityCompat
   import com.example.mywebviewwebrtc.R


   class MainActivity : AppCompatActivity() {
       private var mUploadMessage: ValueCallback<*>? = null
       val REQUEST_SELECT_FILE = 100
       private val FILECHOOSER_RESULTCODE = 1
       var uploadMessage: ValueCallback<Array<Uri>>? = null

       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           setContentView(R.layout.activity_main)

           val WebView: WebView = findViewById(R.id.webview)
           WebView.settings.javaScriptEnabled = true
           WebView.settings.domStorageEnabled = true
           WebView.settings.allowFileAccess = true
           WebView.settings.allowContentAccess = true
           WebView.setWebChromeClient(object : WebChromeClient() {
               override fun onPermissionRequest(request: PermissionRequest) {
                   request.grant(request.resources)
               }

               // For 3.0+ Devices (Start)
               // onActivityResult attached before constructor
               protected fun openFileChooser(uploadMsg: ValueCallback<*>, acceptType: String) {
                   mUploadMessage = uploadMsg
                   val i = Intent(Intent.ACTION_GET_CONTENT)
                   i.addCategory(Intent.CATEGORY_OPENABLE)
                   i.type = "image/*"
                   startActivityForResult(Intent.createChooser(i, "File Chooser"), FILECHOOSER_RESULTCODE)
               }

               // For Lollipop 5.0+ Devices
               @TargetApi(Build.VERSION_CODES.LOLLIPOP)
               override fun onShowFileChooser(mWebView: WebView, filePathCallback: ValueCallback<Array<Uri>>, fileChooserParams: FileChooserParams): Boolean {
                   if (uploadMessage != null) {
                       uploadMessage!!.onReceiveValue(null)
                       uploadMessage = null
                   }

                   uploadMessage = filePathCallback

                   val intent = fileChooserParams.createIntent()
                   try {
                       startActivityForResult(intent, REQUEST_SELECT_FILE)
                   } catch (e: Exception) {
                       uploadMessage = null
                       // util.showToast(this@WebLink, "Cannot Open File Chooser")
                       return false
                   }

                   return true
               }

               //For Android 4.1 only
               protected fun openFileChooser(uploadMsg: ValueCallback<Uri>, acceptType: String, capture: String) {
                   mUploadMessage = uploadMsg
                   val intent = Intent(Intent.ACTION_GET_CONTENT)
                   intent.addCategory(Intent.CATEGORY_OPENABLE)
                   intent.type = "image/*"
                   startActivityForResult(Intent.createChooser(intent, "File Chooser"), FILECHOOSER_RESULTCODE)
               }

               protected fun openFileChooser(uploadMsg: ValueCallback<Uri>) {
                   mUploadMessage = uploadMsg
                   val i = Intent(Intent.ACTION_GET_CONTENT)
                   i.addCategory(Intent.CATEGORY_OPENABLE)
                   i.type = "image/*"
                   startActivityForResult(Intent.createChooser(i, "File Chooser"), FILECHOOSER_RESULTCODE)
               }
           })
           WebView.loadUrl("https://zegocloud.github.io/zego_uikit_prebuilt_web/video_conference/index.html?roomID=zegocloud&role=Host?roomID=zegocloud&role=Host")


           if (!isPermissionGranted()) {
               askPermissions()
           }
       }

       private val permission = arrayOf(
           Manifest.permission.CAMERA,
           Manifest.permission.RECORD_AUDIO,
           Manifest.permission.MODIFY_AUDIO_SETTINGS)

       private val requestCode = 1

       private fun isPermissionGranted(): Boolean {
           permission.forEach {
               if (ActivityCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED)
                   return false
           }

           return true
       }

       private fun askPermissions() {
           ActivityCompat.requestPermissions(this, permission, requestCode)
       }

       override fun onActivityResult(requestCode: Int, resultCode: Int, intent: Intent?) {
           super.onActivityResult(requestCode, resultCode, intent)
           if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
               if (requestCode == REQUEST_SELECT_FILE) {
                   if (uploadMessage == null) return
                   uploadMessage!!.onReceiveValue(
                       WebChromeClient.FileChooserParams.parseResult(
                           resultCode,
                           intent
                       )
                   )
                   uploadMessage = null
               }
           } else if (requestCode == FILECHOOSER_RESULTCODE) {
               if (null == mUploadMessage) return
               // Use MainActivity.RESULT_OK if you're implementing WebView inside Fragment
               // Use RESULT_OK only if you're implementing WebView inside an Activity
               val result =
                   if (intent == null || resultCode != Activity.RESULT_OK) null else intent.data
               mUploadMessage!!.onReceiveValue(result as Nothing?)
               mUploadMessage = null
           }
       }
   }

   ```
3. 打开 **`AndroidManifest.xml`**  添加以下权限

   ```xml
       <uses-permission android:name="android.permission.INTERNET" />
       <uses-permission android:name="android.permission.CAMERA" />
       <uses-permission android:name="android.permission.RECORD_AUDIO" />
       <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
       <uses-permission android:name="android.permission.VIDEO_CAPTURE" />
       <uses-permission android:name="android.permission.AUDIO_CAPTURE" />
       <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
       <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
   ```
4. 在 **activity_main.xml**   添加 webview 的 tag

```xml
       <WebView
           android:id="@+id/webview"
           android:layout_width="match_parent"
           android:layout_height="match_parent"
        /> 
```

#### 运行项目

到这里项目就开发完了，我们连接真机跑起来后效果如下图(图片待补充)
 ![config](../webview/android_kt_finish.jpeg)

#### [点击获取完整示例代码](https://github.com/ZEGOCLOUD/zego_uikits_prebuilt_webview_kotlin)

## iOS平台配置

#### 创建项目

1. 我们使用 Xcode 创建一个空白项目开始，选择 App， 然后点击 next
   ![config](../webview/ios_swift_create_s1.jpeg)
2. 命名项目为 myWebviewWebRTC， 开发语言选择 Swift,点击 next ，选择路径完成项目创建
   ![config](../webview/ios_swift_create_s2.jpeg)

#### 代码实现

1. 修改viewController.swift 如下

   ```swift
   //
   //  ViewController.swift
   //  myWebviewWebRTCIOS
   //
   //  Created by 赵伟 on 2022/12/19.
   //

   import UIKit
   import WebKit

   class ViewController: UIViewController, WKUIDelegate {

       var wkwebview: WKWebView!

       override func viewDidLoad() {
           super.viewDidLoad()
           let request = URLRequest(url: URL(string: "https://zegocloud.github.io/zego_uikit_prebuilt_web/video_conference/index.html?roomID=zegocloud&role=Host")!)
           wkwebview.load(request)
       }
       override func loadView() {
               let webConfiguration = WKWebViewConfiguration()
               webConfiguration.allowsInlineMediaPlayback = true //** Added as an example for your case
               wkwebview = WKWebView(frame: .zero, configuration: webConfiguration)
               wkwebview.uiDelegate = self
               view = wkwebview
           }
   }



   ```
2. 在info.plist中添加摄像头和麦克风权限

```xml
    <key>NSCameraUsageDescription</key>
    <string>We require camera access to connect to a video conference</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>We require microphone access to connect to a video conference</string>
```

#### 运行项目

这里我们使用 Iphone 14 pro 模拟机运行项目（模拟机拿不到真实摄像头画面，所以黑屏是正常），这里会询问是否允许运行摄像头和麦克风，点击同意就可以了

![config](../webview/ios_swift_finish.jpeg)


#### [点击获取完整示例代码](https://github.com/ZEGOCLOUD/zego_uikits_prebuilt_webview_swift)

## Flutter 框架

### 准备工作

1. 运行命令 `flutter create myWebviewWebRTC`  创建新 flutter 项目
2. 为了使用 webview, 我们需要安装 [flutter_inappwebview](https://pub.dev/packages/flutter_inappwebview)，运行命令 `flutter pub add flutter_inappwebview`
3. 为了使用摄像头，麦克风权限，我们还需要安装 [permission_handler](https://pub.dev/packages/permission_handler)，运行命令 `flutter pub add  permission_handler`
4. 修改 lib目录下 main.dart 文件如下：
   ```dart
   import 'dart:async';
   import 'dart:io';
   import 'package:flutter/material.dart';
   import 'package:permission_handler/permission_handler.dart';
   import 'package:url_launcher/url_launcher.dart';
   import 'package:flutter_inappwebview/flutter_inappwebview.dart';

   Future main() async {
     WidgetsFlutterBinding.ensureInitialized();

     if (Platform.isAndroid) {
       await AndroidInAppWebViewController.setWebContentsDebuggingEnabled(true);
     }

     await Permission.camera.request();
     await Permission.microphone.request();

     runApp(const MaterialApp(home: WebviewScreen()));
   }

   class WebviewScreen extends StatefulWidget {
     const WebviewScreen({Key? key}) : super(key: key);

     @override
     State<WebviewScreen> createState() => _WebviewScreenState();
   }

   class _WebviewScreenState extends State<WebviewScreen> {
     final GlobalKey webViewKey = GlobalKey();

     InAppWebViewController? webViewController;
     InAppWebViewGroupOptions options = InAppWebViewGroupOptions(
         crossPlatform: InAppWebViewOptions(
           useShouldOverrideUrlLoading: true,
           mediaPlaybackRequiresUserGesture: false,
         ),
         android: AndroidInAppWebViewOptions(
           useHybridComposition: true,
         ),
         ios: IOSInAppWebViewOptions(
           allowsInlineMediaPlayback: true,
         ));

     @override
     void initState() {
       super.initState();
     }

     @override
     void dispose() {
       super.dispose();
     }

     @override
     Widget build(BuildContext context) {
       return WillPopScope(
         onWillPop: () async {
           // detect Android back button click
           final controller = webViewController;
           if (controller != null) {
             if (await controller.canGoBack()) {
               controller.goBack();
               return false;
             }
           }
           return true;
         },
         child: Scaffold(
             appBar: AppBar(
               title: const Text("InAppWebView test"),
             ),
             body: Column(children: <Widget>[
               Expanded(
                 child: InAppWebView(
                   key: webViewKey,
                   initialUrlRequest: URLRequest(
                       url: Uri.parse(
                           "https://zegocloud.github.io/zego_uikit_prebuilt_web/video_conference/index.html?roomID=zegocloud&role=Host")),
                   initialOptions: options,
                   onWebViewCreated: (controller) {
                     webViewController = controller;
                   },
                   androidOnPermissionRequest:
                       (controller, origin, resources) async {
                     return PermissionRequestResponse(
                         resources: resources,
                         action: PermissionRequestResponseAction.GRANT);
                   },
                 ),
               ),
             ])),
       );
     }
   }

   ```

### 安卓平台专有配置

1. 在 android/app/src/main/AndroidManifest.xmlandroi 中添加相应权限配置

   ```xml
     <uses-permission android:name="android.permission.INTERNET" />
     <uses-permission android:name="android.permission.CAMERA" />
     <uses-permission android:name="android.permission.RECORD_AUDIO" />
     <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
     <uses-permission android:name="android.permission.VIDEO_CAPTURE" />
     <uses-permission android:name="android.permission.AUDIO_CAPTURE" />
   ```
2. 在 android/app/build.gradle 中 设置 compileSdkVersion 为 33

   ```json
   ...
   android {
       compileSdkVersion 33
   ...
   }
   ...
   ```
3. 在 android/app/build.gradle 中 设置 minSdkVersion 为 19

   ```json
   android {
     defaultConfig {
   		minSdkVersion 19
   		...
   	}
     ...
   }
   ```
4. 如果您需要使用白板图片上传功能，您还需要在 android/app/src/main/AndroidManifest.xmlandroi 中添加如下配置

   ```xml
   <application>
   ...
   <provider
               android:name="androidx.core.content.FileProvider"
               android:authorities="${applicationId}.flutter_inappwebview.fileprovider"
               android:exported="false"
               android:grantUriPermissions="true"
           >
               <meta-data
                   android:name="android.support.FILE_PROVIDER_PATHS"
                   android:resource="@xml/provider_paths" />
   </provider>
   </application>
   ```

### iOS平台专有配置

1. 在info.plist中添加摄像头和麦克风权限

```xml
    <key>NSCameraUsageDescription</key>
    <string>We require camera access to connect to a video conference</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>We require microphone access to connect to a video conference</string>
```

### 运行项目

这里以 vscode 为例，选择对应真机运行效果如下（图片待补充）
![config](../webview/ios_swift_finish.jpeg)

#### [点击获取完整示例代码](https://github.com/ZEGOCLOUD/zego_uikits_prebuilt_webview_swift)