import joblib
import pandas as pd
from typing import List
from database import GameResult

# --- CONFIGURATION ---
MODEL_FILE = "adhd_model.joblib"

# --- 1. LOAD THE TRAINED AI MODEL ---
try:
    model = joblib.load(MODEL_FILE)
    print("AI model (3-game) loaded successfully.")
except FileNotFoundError:
    print(f"Warning: AI model file '{MODEL_FILE}' not found.")
    print("Please run 'train_model.py' to create the model.")
    model = None

# --- 2. **UPDATED AND FIXED**: DIAGNOSIS REPORT LOGIC ---
def get_diagnosis_report(diagnosis_games: List[GameResult]):
    """
    Analyzes the THREE diagnosis games and returns an AI-powered report.
    """
    if not model: return {"error": "AI model not loaded."}
    
    # **FIX:** Now expects 3 games
    if len(diagnosis_games) < 3:
        return {"error": f"Not enough games. Expected 3, got {len(diagnosis_games)}."}

    # Find each of the three required games from the provided list
    reaction_game = next((g for g in diagnosis_games if g.game_name == "Reaction"), None)
    memory_game = next((g for g in diagnosis_games if g.game_name == "Memory"), None)
    stroop_game = next((g for g in diagnosis_games if g.game_name == "Stroop"), None)

    if not all([reaction_game, memory_game, stroop_game]):
        return {"error": "Reaction, Memory, and Stroop game results are all required."}
    
    # **FIX:** Prepare the data with all 12 features in the correct order for the new model
    feature_data = [
        reaction_game.avg_reaction_time_sec, reaction_game.error_rate_percent, reaction_game.focus_score_percent, reaction_game.accuracy_percent,
        memory_game.avg_reaction_time_sec, memory_game.error_rate_percent, memory_game.focus_score_percent, memory_game.accuracy_percent,
        stroop_game.avg_reaction_time_sec, stroop_game.error_rate_percent, stroop_game.focus_score_percent, stroop_game.accuracy_percent,
    ]
    
    live_data = pd.DataFrame([feature_data], columns=model.feature_names_in_)
    prediction_probability = model.predict_proba(live_data)[0][1]
    raw_adhd_risk_percent = prediction_probability * 100

    # Keep the confidence scaler to ensure realistic outputs
    scaled_adhd_risk_percent = 20 + (raw_adhd_risk_percent * 0.6)

    # **FIX:** Update XAI to potentially include Stroop game factors
    explanation = "The risk assessment was based on patterns learned from your gameplay across all three diagnosis tasks."
    key_factors = []
    if stroop_game.error_rate_percent > 25:
        explanation = "A higher number of errors in the Stroop task, which tests selective attention and impulse control, was a key factor in the assessment."
        key_factors.append({"metric": "Error Rate (Stroop)", "impact": "High"})
    elif memory_game.error_rate_percent > 20:
        key_factors.append({"metric": "Error Rate (Memory)", "impact": "Medium"})
    if reaction_game.avg_reaction_time_sec > 1.2:
        key_factors.append({"metric": "Reaction Time (Reaction)", "impact": "Medium"})
        
    return {
        "report_type": "diagnosis", 
        "adhd_risk_percent": round(scaled_adhd_risk_percent, 1),
        "explanation": explanation, 
        "key_factors": key_factors
    }

# --- 3. IMPROVEMENT REPORT LOGIC (Unchanged) ---
def get_improvement_report(all_games: List[GameResult]):
    # ... (This function is correct and remains unchanged) ...
    diagnosis_games = [g for g in all_games if g.session_type == "diagnosis"]
    improvement_games = [g for g in all_games if g.session_type == "improvement"]
    if not diagnosis_games or not improvement_games: return {"error": "Diagnosis and improvement data required."}
    first_session_id = diagnosis_games[0].session_id
    baseline_games = [g for g in diagnosis_games if g.session_id == first_session_id]
    baseline_focus_avg = sum(g.focus_score_percent for g in baseline_games) / len(baseline_games) if baseline_games else 0
    latest_session_id = improvement_games[-1].session_id
    latest_improvement_games = [g for g in improvement_games if g.session_id == latest_session_id]
    current_focus_avg = sum(g.focus_score_percent for g in latest_improvement_games) / len(latest_improvement_games) if latest_improvement_games else 0
    improvement_percent = 0
    if baseline_focus_avg > 0:
        improvement_percent = ((current_focus_avg - baseline_focus_avg) / baseline_focus_avg) * 100
    explanation = "This report compares your average Focus Score from your latest improvement session against the average from your first diagnosis session."
    key_factors = []
    game_names_to_find = ["Stroop", "Breathing", "N-Back"]
    for game_name in game_names_to_find:
        latest_game = next((g for g in latest_improvement_games if g.game_name == game_name), None)
        if latest_game:
            change = latest_game.focus_score_percent - baseline_focus_avg
            sign = "+" if change >= 0 else ""
            key_factors.append({"metric": f"Focus Score ({game_name})", "change": f"{sign}{change:.1f}%" })
    return {
        "report_type": "improvement", "overall_improvement_percent": round(improvement_percent, 1),
        "explanation": explanation, "key_factors": key_factors
    }

# --- 4. DASHBOARD DATA LOGIC (Unchanged) ---
def get_dashboard_data(all_games: List[GameResult]):
    # ... (This function is correct and remains unchanged) ...
    if not all_games: return {"error": "No game data available."}
    latest_session_id = all_games[-1].session_id
    latest_session_games = [g for g in all_games if g.session_id == latest_session_id]
    num_latest_games = len(latest_session_games)
    avg_rt = sum(g.avg_reaction_time_sec for g in latest_session_games) / num_latest_games if num_latest_games > 0 else 0
    avg_rt_score = max(0, 100 - (avg_rt * 20))
    avg_accuracy = sum(g.accuracy_percent for g in latest_session_games) / num_latest_games if num_latest_games > 0 else 0
    avg_focus = sum(g.focus_score_percent for g in latest_session_games) / num_latest_games if num_latest_games > 0 else 0
    avg_error = sum(g.error_rate_percent for g in latest_session_games) / num_latest_games if num_latest_games > 0 else 0
    improvement_games = [g for g in all_games if g.session_type == "improvement"]
    sessions = {}
    for game in improvement_games:
        if game.session_id not in sessions: sessions[game.session_id] = []
        sessions[game.session_id].append(game)
    sorted_sessions = []
    for session_id, games_in_session in sessions.items():
        if len(games_in_session) >= 2:
            start_id = min(g.id for g in games_in_session)
            avg_score = sum(g.focus_score_percent for g in games_in_session) / len(games_in_session)
            sorted_sessions.append({'start_id': start_id, 'avg_score': avg_score})
    sorted_sessions.sort(key=lambda s: s['start_id'])
    last_10_sessions = sorted_sessions[-10:]
    chart_labels = [f"S{i+1}" for i in range(len(last_10_sessions))]
    chart_focus_scores = [s['avg_score'] for s in last_10_sessions]
    return {
        "averageMetrics": {
            "reactionTime": round(avg_rt_score, 1), "accuracy": round(avg_accuracy, 1),
            "focusScore": round(avg_focus, 1), "errorRate": round(avg_error, 1)
        },
        "progressChart": { "labels": chart_labels, "focusScores": [round(score, 1) for score in chart_focus_scores] }
    }

