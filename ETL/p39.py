import pandas as pd


def calculate_average_salary(path: str) -> None:
    df = pd.read_csv(path)
    if "salary" in df.columns:
        print(df["salary"].mean())
    else:
        print("No salary column found")


if __name__ == "__main__":
    calculate_average_salary("ETL/new2json/new2.csv")
