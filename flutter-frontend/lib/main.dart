import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:kisan_guru_ai/core/theme/app_theme.dart';
import 'package:kisan_guru_ai/core/network/dio_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const KisanGuruApp());
}

class KisanGuruApp extends StatelessWidget {
  const KisanGuruApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kisan Guru AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const KisanGuruHome(),
    );
  }
}

class KisanGuruHome extends StatelessWidget {
  const KisanGuruHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kisan Guru AI (किसान गुरु)'),
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).scaffoldBackgroundColor,
              Theme.of(context).primaryColor.withOpacity(0.05),
            ],
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Hero(
                  tag: 'app-logo',
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.eco,
                      size: 100,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Welcome to Kisan Guru AI',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'India\'s most advanced AI smart farming ecosystem. Diagnosis crop disease, check weather plans, and rent agricultural machinery.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 15, color: Colors.grey, height: 1.4),
                ),
                const SizedBox(height: 48),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LeafScannerScreen()),
                    );
                  },
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Scan Crop Disease (कृषि जाँच)'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class LeafScannerScreen extends StatefulWidget {
  const LeafScannerScreen({super.key});

  @override
  State<LeafScannerScreen> createState() => _LeafScannerScreenState();
}

class _LeafScannerScreenState extends State<LeafScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _isProcessing = false;
  final DioClient _client = DioClient(baseUrl: 'http://127.0.0.1:8000/api');

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _triggerSimulatedScan(String leafType) async {
    setState(() {
      _isProcessing = true;
    });

    try {
      // Setup multipart form data upload
      final formData = FormData.fromMap({
        'image': MultipartFile.fromBytes(
          [67, 82, 79, 80], // Simulated image bytes representing 'CROP'
          filename: '${leafType}_leaf.jpg',
        ),
      });

      // Call FastAPI diagnostics endpoint
      final response = await _client.dio.post(
        '/crops/diagnose',
        data: formData,
      );

      if (mounted) {
        _showResultDialog(
          disease: response.data['disease_detected'],
          confidence: response.data['confidence'],
          remedy: response.data['remedy'],
          isOffline: false,
        );
      }
    } catch (e) {
      // Offline fallback diagnostic rules (local TFLite edge simulation)
      String disease;
      double confidence;
      String remedy;

      if (leafType == 'wheat') {
        disease = 'Yellow Rust (Puccinia striiformis) [Edge Config]';
        confidence = 0.88;
        remedy = 'Apply Propiconazole 25% EC @ 200 ml/acre. Use resistant seeds DBW-187.';
      } else if (leafType == 'tomato') {
        disease = 'Early Blight (Alternaria solani) [Edge Config]';
        confidence = 0.85;
        remedy = 'Spray Mancozeb 75% WP @ 600g/acre. Prune lower foliage.';
      } else {
        disease = 'General Nutrient Stress [Edge Config]';
        confidence = 0.75;
        remedy = 'Apply balanced NPK organic composting. Avoid overwatering.';
      }

      if (mounted) {
        _showResultDialog(
          disease: disease,
          confidence: confidence,
          remedy: remedy,
          isOffline: true,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  void _showResultDialog({
    required String disease,
    required double confidence,
    required String remedy,
    required bool isOffline,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Icon(
                isOffline ? Icons.offline_bolt : Icons.check_circle,
                color: isOffline ? Colors.orange : Colors.green,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isOffline ? 'Offline Edge Diagnosis' : 'AI Analysis Complete',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Detected Condition:',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
                ),
                Text(
                  disease,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.redAccent),
                ),
                const SizedBox(height: 12),
                Text('Confidence Score: ${(confidence * 100).toStringAsFixed(1)}%'),
                const SizedBox(height: 16),
                const Text(
                  'Recommended Action Plan:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  remedy,
                  style: const TextStyle(fontSize: 14, height: 1.4),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('DISMISS'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('AI Disease Scanner'),
      ),
      body: Stack(
        children: [
          // Viewfinder Target Frame
          Center(
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),
          // Scanner Shutter overlay
          if (_isProcessing)
            const Center(
              child: Card(
                color: Colors.black54,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: Colors.green),
                      SizedBox(height: 12),
                      Text(
                        'Running leaf classification...',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          // Viewfinder animated scan bar line
          if (!_isProcessing)
            AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                final topOffset = 180 + (_animationController.value * 280);
                return Positioned(
                  top: topOffset,
                  left: MediaQuery.of(context).size.width / 2 - 130,
                  child: Container(
                    width: 260,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green.withOpacity(0.8),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          // Action Buttons panel
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Column(
              children: [
                const Text(
                  'Select leaf type to simulate scanning:',
                  style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: _isProcessing ? null : () => _triggerSimulatedScan('wheat'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[800]),
                      child: const Text('Wheat (गेहूं)'),
                    ),
                    ElevatedButton(
                      onPressed: _isProcessing ? null : () => _triggerSimulatedScan('tomato'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red[800]),
                      child: const Text('Tomato (टमाटर)'),
                    ),
                    ElevatedButton(
                      onPressed: _isProcessing ? null : () => _triggerSimulatedScan('general'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[800]),
                      child: const Text('General'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
