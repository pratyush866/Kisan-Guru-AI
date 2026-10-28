import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import test functions
from tests.test_irrigation import (
  test_irrigation_recommendation_success,
  test_soil_report_scoring,
  test_soil_report_history,
  test_sensor_telemetry_upload,
  test_get_latest_sensors,
  test_create_water_record,
  test_get_water_records_history,
  test_get_irrigation_schedule,
  test_get_irrigation_alerts,
  test_get_water_analytics
)

if __name__ == "__main__":
  tests = [
    test_irrigation_recommendation_success,
    test_soil_report_scoring,
    test_soil_report_history,
    test_sensor_telemetry_upload,
    test_get_latest_sensors,
    test_create_water_record,
    test_get_water_records_history,
    test_get_irrigation_schedule,
    test_get_irrigation_alerts,
    test_get_water_analytics
  ]
  
  passed = 0
  failed = 0
  
  print("Running Smart Irrigation Backend Suite (Standard Library Mode)...")
  print("=" * 70)
  
  for t in tests:
    name = t.__name__
    try:
      t()
      print(f"[PASS] {name}")
      passed += 1
    except Exception as e:
      print(f"[FAIL] {name}")
      import traceback
      traceback.print_exc()
      failed += 1
      
  print("=" * 70)
  print(f"Test Results: {passed} passed, {failed} failed")
  
  if failed > 0:
    sys.exit(1)
  else:
    sys.exit(0)
