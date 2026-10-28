from pathlib import Path
import pandas as pd


def clean_csv(input_csv: str, output_csv: str) -> None:
    df = pd.read_csv(input_csv)
    df = df.dropna()
    df.columns = [col.strip().lower() for col in df.columns]
    df.to_csv(output_csv, index=False)


if __name__ == "__main__":
    clean_csv("ETL/new2json/new4.csv", "ETL/Output/new4_clean.csv")
