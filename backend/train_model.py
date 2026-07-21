import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

# --- CONFIGURATION ---
DATASET_FILE = "adhd_mock_data.csv"
MODEL_OUTPUT_FILE = "adhd_model.joblib"

def train_adhd_model():
    """
    Loads the 3-game mock data, trains a logistic regression model,
    and saves the trained model to a file.
    """
    # 1. Load the dataset using pandas
    try:
        df = pd.read_csv(DATASET_FILE)
    except FileNotFoundError:
        print(f"Error: Dataset file '{DATASET_FILE}' not found.")
        print("Please run 'generate_dataset.py' first to create the data.")
        return

    # 2. Separate the data into features (X) and the target/label (y)
    # X now contains all 12 metric columns from the three games
    X = df.drop("has_adhd", axis=1) 
    y = df["has_adhd"]

    # 3. Split the data into a training set and a testing set
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 4. Create and train the Logistic Regression model
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    # 5. Evaluate the model's performance on the test data
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained on 3-game data. Accuracy on test data: {accuracy:.2f}")

    # 6. Save the trained model to a file
    joblib.dump(model, MODEL_OUTPUT_FILE)
    print(f"Model training complete! Saved to '{MODEL_OUTPUT_FILE}'.")


if __name__ == "__main__":
    train_adhd_model()

