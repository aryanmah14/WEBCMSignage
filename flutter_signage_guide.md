# Flutter Signage Player Guide

This guide explains how to implement the Signage Player (auto-scrolling images and video playback) in a Flutter application, consuming the Node.js API we built.

## Prerequisites

Add the following dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  video_player: ^2.7.0
  chewie: ^1.7.0 # Optional, for better video controls/UI
  cached_network_image: ^3.3.0 # Recommended for caching images
```

## Implementation

### 1. Data Model (`media_item.dart`)

```dart
class MediaItem {
  final int id;
  final String url;
  final String type; // 'image' or 'video'
  final String? s3Key;

  MediaItem({
    required this.id,
    required this.url,
    required this.type,
    this.s3Key,
  });

  factory MediaItem.fromJson(Map<String, dynamic> json) {
    return MediaItem(
      id: json['id'],
      url: json['url'],
      type: json['type'],
      s3Key: json['s3_key'],
    );
  }
}
```

### 2. Signage Screen (`signage_screen.dart`)

```dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:video_player/video_player.dart';
import 'media_item.dart';

class SignageScreen extends StatefulWidget {
  const SignageScreen({Key? key}) : super(key: key);

  @override
  State<SignageScreen> createState() => _SignageScreenState();
}

class _SignageScreenState extends State<SignageScreen> {
  List<MediaItem> _mediaList = [];
  int _currentIndex = 0;
  bool _isLoading = true;
  VideoPlayerController? _videoController;
  Timer? _imageTimer;
  
  // CONFIG
  static const String apiUrl = 'http://YOUR_LOCAL_IP:5000/api/media-list'; // Use Local IP for emulator
  static const int imageDurationSeconds = 5;

  @override
  void initState() {
    super.initState();
    _fetchMedia();
  }

  Future<void> _fetchMedia() async {
    try {
      final response = await http.get(Uri.parse(apiUrl));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _mediaList = data.map((item) => MediaItem.fromJson(item)).toList();
          _isLoading = false;
        });
        _playMedia();
      } else {
        throw Exception('Failed to load media');
      }
    } catch (e) {
      print('Error fetching media: $e');
      setState(() => _isLoading = false);
    }
  }

  void _playMedia() async {
    if (_mediaList.isEmpty) return;

    final item = _mediaList[_currentIndex];

    // CLEANUP
    _imageTimer?.cancel();
    if (_videoController != null) {
      await _videoController!.dispose();
      _videoController = null;
    }

    if (item.type == 'image') {
      // IMAGE LOGIC
      setState(() {}); // Rebuild to show image
      _imageTimer = Timer(const Duration(seconds: imageDurationSeconds), _nextSlide);
    } else if (item.type == 'video') {
      // VIDEO LOGIC
      _videoController = VideoPlayerController.networkUrl(Uri.parse(item.url));
      await _videoController!.initialize();
      _videoController!.play();
      _videoController!.addListener(() {
        if (_videoController!.value.position >= _videoController!.value.duration) {
          _nextSlide();
        }
      });
      setState(() {}); // Rebuild to show video
    }
  }

  void _nextSlide() {
    if (!mounted) return;
    setState(() {
      _currentIndex = (_currentIndex + 1) % _mediaList.length;
    });
    _playMedia();
  }

  @override
  void dispose() {
    _imageTimer?.cancel();
    _videoController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_mediaList.isEmpty) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: Text('No media found', style: TextStyle(color: Colors.white))),
      );
    }

    final item = _mediaList[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: item.type == 'image'
            ? Image.network(
                item.url,
                fit: BoxFit.contain,
                width: double.infinity,
                height: double.infinity,
                errorBuilder: (ctx, err, stack) => const Icon(Icons.error, color: Colors.red),
              )
            : _videoController != null && _videoController!.value.isInitialized
                ? AspectRatio(
                    aspectRatio: _videoController!.value.aspectRatio,
                    child: VideoPlayer(_videoController!),
                  )
                : const CircularProgressIndicator(),
      ),
    );
  }
}
```

### Important Notes for Flutter
1.  **Network Access**: specific for Android/iOS:
    -   **Android (`AndroidManifest.xml`)**: Add `<uses-permission android:name="android.permission.INTERNET" />`.
    -   **iOS (`Info.plist`)**: Add `NSAppTransportSecurity` to allow HTTP (if using localhost) or just standard HTTPS access.
2.  **Localhost**:
    -   If running on Android Emulator, `localhost` refers to the device itself. Use `10.0.2.2` to access your PC's localhost.
    -   If running on a physical device, ensure both phone and PC are on the same Wi-Fi and use your PC's LAN IP (e.g., `192.168.1.x`).
