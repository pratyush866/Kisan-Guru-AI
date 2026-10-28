from pathlib import Path
import pandas as pd


def convert_csv_to_json(input_csv: str, output_json: str) -> None:
    df = pd.read_csv(input_csv)
    output_path = Path(output_json)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_json(output_path, orient="records", indent=2)


if __name__ == "__main__":
    convert_csv_to_json("ETL/new2json/new2.csv", "ETL/Output/new2.json")
