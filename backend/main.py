from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

# Import components from our other backend files
import ai_module
from database import create_db_and_tables, engine, get_session, User, GameResult


# Create the main FastAPI application
app = FastAPI(title="NeuroPlay API")

# Add the CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This function runs once when the server starts up
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        existing_user = session.get(User, 1)
        if not existing_user:
            dummy_user = User(id=1, username="CookiePookie", hashed_password="12345")
            session.add(dummy_user)
            session.commit()
            print("Dummy user 'CookiePookie' created.")

# --- API ENDPOINT TO SAVE GAME RESULTS (Unchanged) ---
@app.post("/save_result", response_model=GameResult)
def save_game_result(result: GameResult, session: Session = Depends(get_session)):
    session.add(result)
    session.commit()
    session.refresh(result)
    print(f"Saved result for game: {result.game_name}, User: {result.user_id}")
    return result

# --- **UPDATED AND FIXED**: API ENDPOINT TO GET AI REPORTS ---
@app.get("/get_report/{user_id}")
def get_report(user_id: str, report_type: str, session: Session = Depends(get_session)):
    """
    Fetches game data for a user and generates the requested AI report.
    report_type can be 'diagnosis', 'improvement', or 'dashboard'.
    """
    # 1. Fetch all game results for the specified user, ordered by when they were played
    statement = select(GameResult).where(GameResult.user_id == user_id).order_by(GameResult.id)
    all_games = session.exec(statement).all()

    if not all_games:
        raise HTTPException(status_code=404, detail="No game data found for this user.")

    # 2. Call the appropriate function from the AI module based on the report_type
    if report_type == "diagnosis":
        # **FIX:** Find the session ID of the most recently played game
        latest_session_id = all_games[-1].session_id
        
        # **FIX:** Filter to get all diagnosis games from that specific session
        diagnosis_games_for_session = [
            g for g in all_games 
            if g.session_id == latest_session_id and g.session_type == "diagnosis"
        ]
        
        # Pass the list of (now 3) games to the AI module
        return ai_module.get_diagnosis_report(diagnosis_games_for_session)
    
    elif report_type == "improvement":
        return ai_module.get_improvement_report(all_games)
        
    elif report_type == "dashboard":
        return ai_module.get_dashboard_data(all_games)

    else:
        raise HTTPException(status_code=400, detail="Invalid report_type specified.")


# A simple root endpoint to confirm the server is running
@app.get("/")
def read_root():
    return {"message": "Welcome to the NeuroPlay API!"}

