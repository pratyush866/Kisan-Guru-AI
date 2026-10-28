from pathlib import Path
import pandas as pd


def summarize_csv(path: str) -> None:
    df = pd.read_csv(path)
    print(df.head())
    print(f"Rows: {len(df)}, Columns: {list(df.columns)}")


if __name__ == "__main__":
    summarize_csv("ETL/new2json/new3.csv")
