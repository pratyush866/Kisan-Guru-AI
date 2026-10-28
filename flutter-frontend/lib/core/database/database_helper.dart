import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('kisan_guru_pest.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);
    return await openDatabase(
      path, 
      version: 1, 
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // 1. Local Cached Reports Table
    await db.execute('''
      CREATE TABLE pest_reports (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        pest_detected TEXT NOT NULL,
        confidence REAL NOT NULL,
        severity TEXT NOT NULL,
        damage_description TEXT,
        spread_risk_percentage REAL NOT NULL,
        treatment_plan_json TEXT NOT NULL,
        crop_loss_percentage REAL NOT NULL,
        urgency_level TEXT NOT NULL,
        location_latitude REAL,
        location_longitude REAL,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    ''');

    // 2. Offline Sync Outbox Queue Table
    await db.execute('''
      CREATE TABLE pest_queue (
        tempId TEXT PRIMARY KEY,
        crop_name TEXT NOT NULL,
        model_arch TEXT NOT NULL,
        imageDataUrl TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');
  }

  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
    }
  }
}
