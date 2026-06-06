# Oh Hell Scorekeeper

#### Video Demo:

https://youtu.be/4J0etN2x_GE

#### Description:

A scorekeeper for the card game _Oh Hell_, made as a final project for the CS50’s Introduction to Programming with Python course from Harvard.

## Introduction

I often play the card game _Oh Hell_ (known as _Boerenbridge_ in Dutch) with my family. We traditionally keep score with pen and paper. So I thought: why not use this CS50p final project as an opportunity to build a small program for this task...

---

## Project Overview

This project is a command-line scorekeeper for the card game _Oh Hell_.
For information about the game itself I would like to link to: https://en.wikipedia.org/wiki/Oh_hell

The program enforces the main rules of _Oh Hell_, a short summary of the flow:

- It starts by initialising the amount of rounds and players.
- Players bid the number of tricks they expect to win.
- The sum of bids in a round cannot equal the number of available tricks (to avoid perfect balance).
- After each round is played, players record their actual tricks won (the tricks have to match the wins).
- Points are awarded or deducted based on how accurate the bid was.
- After all rounds are played a winner is determined and the user is asked to play again.

---

## File Structure

- **`project.py`**  
  Main script with the terminal game logic, classes, and functions.

  - **Classes**
    - `Game`: keeps track of rounds, players, and overall status.
      - `__str__()`: string representation with status and players.
      - `decrement_round()`: decreases the number of rounds left.
      - `leaderboard`: (property) sorted list of players by score.
      - `show_leaderboard()`: prints the current standings.
      - `winners()`: finds and returns the winner(s) and highest score.
    - `Player`: represents a player with name and score.
      - `__str__()`: string representation with name and score.
      - `update_score(points)`: calculates and adds points to the score.

  - **Functions**
    - `main()`: starts the game and asks if players want to play again.
    - `play_game()`: initializes the game and runs the rounds.
    - `init_game()`: collects player names and rounds, creates a `Game` object.
    - `play_round(game, round_number)`: logic for a single round:
      - defines tricks per round,
      - collect bids,
      - record trick wins,
      - update scores.

- **`helpers.py`**  
  Contains utility functions used in the terminal game, such as:
  - `parse_players`: ensures player names are valid and unique.
  - `join_names`: creates a string of given names.
  - `validate_rounds`: validates the number of rounds input.
  - `wait_for_enter`: pauses execution until the player confirms.
  - `clear_screen`: clears the terminal for readability.

- **`test_project.py`** & **`test_helpers.py`**  
  Unit tests for the Python terminal app functions and classes.

- **`frontend/`**  
  The modern, responsive React + Vite web version of the score saver designed for browsers and mobile devices.
  - **`src/App.jsx`**: Core React component managing the game state (setup, bids, tricks, wins, history, undo/redo, and leaderboard).
  - **`src/index.css`**: Sleek, custom glassmorphic stylesheet designed mobile-first.
  - **`src/main.jsx`**: Vite entry point rendering the app.

---

## Scoring Rules

- Exact bid: **10 points + (2 × tricks won)**
- Incorrect bid: **–2 points for each trick off the guess**

For example:

- If a player bids 3 and wins 3 → they earn 16 points.
- If a player bids 2 and wins 5 → they lose 6 points.

---

## Design Decisions

- **Class-based design**: `Game` and `Player` classes make the logic more modular, so features (like undo/redo or saving scores) can be added later without rewriting the whole game.
- **Command-line interface**: Chosen for simplicity and focus on gameplay logic. The project could later be extended into a GUI or web app.
- **Validation checks**: User input is validated at every step (bids, wins, rounds, player names) to reduce errors during gameplay.
- **Some allowed flexability**: I tried to implement some checks and balances via try-blocks. Also the user is allowed to redo or skip a round.

---

## Installation & Running the Project

### Clone the Repository

```bash
git clone https://github.com/moreniekmeijer/oh_hell_score_saver.git
cd oh_hell_score_saver
```

### Option A: Running the React Web Application (Recommended for Mobile/Browser)

The web app is stored in the `frontend` folder and features a premium UI, responsive layout, local storage persistence, and undo/redo support.

#### Requirements
- Node.js (v18+) and npm

#### Installation & Startup
```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Run the local development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

#### Build for Production
To bundle the web app for hosting (or running locally on mobile):
```bash
npm run build
```

---

### Option B: Running the Python Terminal Game

#### Requirements
- Python 3.10+
- (Optional) `pytest` for running unit tests

#### Setup & Startup
```bash
# Install dependencies (only required for testing)
pip install -r requirements.txt

# Run the terminal game
python project.py
```

#### Run Terminal Game Tests
```bash
pytest test_project.py test_helpers.py
```

## Future Improvements

- Save and load past games from file (score history).
- Show some more game statistics and summaries.
- Add support for custom bidding/scoring variants.

## How to Contribute

This project was built as a personal tool, but contributions are welcome.  
Feel free to open issues or submit pull requests to improve the gameplay, add features, or fix bugs.
