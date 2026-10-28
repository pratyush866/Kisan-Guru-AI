from pathlib import Path
import json
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent.parent
JSON_DIR = ROOT_DIR / "JSON"
OUTPUT_DIR = ROOT_DIR / "Output"
INPUT_FILE = JSON_DIR / "employees.json"
CLEANED_FILE = OUTPUT_DIR / "cleaned_data.json"
KPI_FILE = OUTPUT_DIR / "emp_KPI.json"


def load_employee_data(path: Path) -> pd.DataFrame:
    with path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    return pd.DataFrame(data)


def clean_employee_data(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    cleaned.columns = [col.strip().lower() for col in cleaned.columns]

    if "employee_name" in cleaned.columns:
        cleaned = cleaned.rename(columns={"employee_name": "name"})
    if "dept" in cleaned.columns:
        cleaned = cleaned.rename(columns={"dept": "department"})

    cleaned = cleaned.dropna(subset=["name", "department"]).copy()
    cleaned["name"] = cleaned["name"].astype(str).str.strip().str.title()
    cleaned["department"] = cleaned["department"].astype(str).str.strip().str.title()
    cleaned["salary"] = pd.to_numeric(cleaned.get("salary", pd.Series([0] * len(cleaned))), errors="coerce")
    cleaned["salary"] = cleaned["salary"].fillna(0)
    cleaned["experience"] = pd.to_numeric(cleaned.get("experience", pd.Series([0] * len(cleaned))), errors="coerce")
    cleaned["experience"] = cleaned["experience"].fillna(0).astype(int)
    cleaned["email"] = cleaned.get("email", pd.Series([""] * len(cleaned))).astype(str).str.strip()
    cleaned["email"] = cleaned["email"].replace({"nan": "", "None": ""})
    cleaned = cleaned.reset_index(drop=True)
    return cleaned


def save_json(path: Path, payload) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)


def calculate_kpis(df: pd.DataFrame) -> list[dict]:
    grouped = df.groupby("department", as_index=False).agg(
        average_salary=("salary", "mean"),
        employee_count=("name", "count"),
    )
    grouped["average_salary"] = grouped["average_salary"].round(2)
    return grouped.to_dict(orient="records")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    raw_df = load_employee_data(INPUT_FILE)
    cleaned_df = clean_employee_data(raw_df)

    cleaned_records = cleaned_df.to_dict(orient="records")
    save_json(CLEANED_FILE, cleaned_records)

    kpi_results = calculate_kpis(cleaned_df)
    save_json(KPI_FILE, kpi_results)

    print(f"Cleaned data saved to {CLEANED_FILE}")
    print(f"KPI report saved to {KPI_FILE}")


if __name__ == "__main__":
    main()
