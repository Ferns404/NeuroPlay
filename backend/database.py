from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session


# --- 1. DEFINE THE DATABASE TABLE MODELS ---
# This is the blueprint for our 'user' table.
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str # We won't implement real hashing for the demo


# This is the blueprint for our 'gameresult' table.
# Notice how the field names match our JavaScript payload perfectly.
class GameResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    session_id: str
    session_type: str
    game_name: str
    avg_reaction_time_sec: float
    error_rate_percent: float
    focus_score_percent: float
    accuracy_percent: float
    total_time_sec: int


# --- 2. SETUP THE DATABASE CONNECTION ---
# We're creating a simple file named "neuroplay.db" to store our data.
sqlite_file_name = "neuroplay.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# The engine is the core interface to the database.
engine = create_engine(sqlite_url, echo=True)


# --- 3. CREATE THE DATABASE AND TABLES ---
def create_db_and_tables():
    # This function creates the database file and the tables if they don't exist.
    SQLModel.metadata.create_all(engine)


# --- 4. FUNCTION TO GET A DATABASE SESSION ---
# We'll use this in our API to talk to the database.
def get_session():
    with Session(engine) as session:
        yield session
