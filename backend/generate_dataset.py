import csv
import random

# --- CONFIGURATION ---
NUM_SAMPLES = 2000
OUTPUT_FILE = "adhd_mock_data.csv"
FORGIVENESS_WINDOW = 3 # This MUST match the JavaScript forgiveness window

def generate_persona_data(persona_type):
    """
    Generates game metrics based on a specific cognitive persona, now including Stroop data
    and simulating the memory game's error forgiveness logic.
    """
    # --- ADHD PERSONAS ---
    if persona_type == "classic_inattentive":
        re_rt = random.uniform(0.9, 1.7)
        mem_total_moves = random.randint(16, 22)
        mem_raw_errors = random.randint(8, 14)
        st_err = random.uniform(20, 40)
        st_rt = random.uniform(1.2, 2.0)
        has_adhd = 1
    elif persona_type == "hyperfocused_impulsive":
        re_rt = random.uniform(0.45, 0.9)
        mem_total_moves = random.randint(14, 20)
        mem_raw_errors = random.randint(6, 12)
        st_err = random.uniform(25, 45)
        st_rt = random.uniform(0.8, 1.5)
        has_adhd = 1
    elif persona_type == "variable":
        re_rt = random.uniform(0.6, 2.0)
        mem_total_moves = random.randint(12, 25)
        mem_raw_errors = random.randint(4, 15)
        st_err = random.uniform(15, 45)
        st_rt = random.uniform(1.0, 2.5)
        has_adhd = 1
    # NEW ADHD Persona
    elif persona_type == "executive_deficit":
        re_rt = random.uniform(0.7, 1.2) # Decent reaction time
        mem_total_moves = random.randint(11, 16) # Decent memory
        mem_raw_errors = random.randint(3, 7)
        st_err = random.uniform(30, 50) # Struggles specifically with Stroop test
        st_rt = random.uniform(1.5, 2.5)
        has_adhd = 1

    # --- NON-ADHD PERSONAS ---
    elif persona_type == "neurotypical_high_performer":
        re_rt = random.uniform(0.5, 1.0)
        mem_total_moves = random.randint(10, 14)
        mem_raw_errors = random.randint(2, 6)
        st_err = random.uniform(5, 15)
        st_rt = random.uniform(0.9, 1.4)
        has_adhd = 0
    elif persona_type == "neurotypical_careful":
        re_rt = random.uniform(0.9, 1.6)
        mem_total_moves = random.randint(12, 18)
        mem_raw_errors = random.randint(2, 5)
        st_err = random.uniform(5, 18)
        st_rt = random.uniform(1.4, 2.2)
        has_adhd = 0
    # NEW Non-ADHD Persona
    elif persona_type == "neurotypical_gamer":
        re_rt = random.uniform(0.4, 0.8) # Very fast RT
        mem_total_moves = random.randint(12, 18)
        mem_raw_errors = random.randint(4, 9) # A few more mistakes due to speed
        st_err = random.uniform(10, 22) # More impulsive than careful user
        st_rt = random.uniform(0.8, 1.6)
        has_adhd = 0
    else: # Fallback
        return None

    # --- SIMULATE ERROR FORGIVENESS FOR MEMORY GAME ---
    forgiven_errors = min(mem_raw_errors, FORGIVENESS_WINDOW)
    counted_wrong_attempts = mem_raw_errors - forgiven_errors
    counted_trials = mem_total_moves - forgiven_errors
    mem_err = (counted_wrong_attempts / counted_trials) * 100 if counted_trials > 0 else 0
    
    # Estimate a realistic memory reaction time based on moves
    mem_rt = (mem_total_moves * 2.5 + random.uniform(-5, 5)) / (mem_total_moves * 2)

    # Calculate derived metrics
    re_err = 0; re_acc = 100; re_foc = max(0, 100 - (re_rt * 10))
    mem_acc = 100 - mem_err; mem_foc = max(0, 100 - mem_err - (mem_rt * 10))
    st_acc = 100 - st_err; st_foc = max(0, 100 - st_err - (st_rt * 10))

    return [
        round(re_rt, 3), round(re_err, 2), round(re_foc, 2), round(re_acc, 2),
        round(mem_rt, 3), round(mem_err, 2), round(mem_foc, 2), round(mem_acc, 2),
        round(st_rt, 3), round(st_err, 2), round(st_foc, 2), round(st_acc, 2),
        has_adhd
    ]

def generate_mock_data():
    headers = [
        "avg_reaction_time_sec_re", "error_rate_percent_re", "focus_score_percent_re", "accuracy_percent_re",
        "avg_reaction_time_sec_mem", "error_rate_percent_mem", "focus_score_percent_mem", "accuracy_percent_mem",
        "avg_reaction_time_sec_st", "error_rate_percent_st", "focus_score_percent_st", "accuracy_percent_st",
        "has_adhd"
    ]
    # Expanded list of personas
    personas = [
        "classic_inattentive", "hyperfocused_impulsive", "variable", "executive_deficit",
        "neurotypical_high_performer", "neurotypical_careful", "neurotypical_gamer"
    ]
    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for _ in range(NUM_SAMPLES):
            chosen_persona = random.choice(personas)
            data_row = generate_persona_data(chosen_persona)
            if data_row:
                writer.writerow(data_row)
    print(f"Successfully generated {NUM_SAMPLES} hyper-realistic (3-game) samples in '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    generate_mock_data()

