# Oh Hell Scorekeeper
#### Video Demo: <URL HERE>
#### Description:

## Introduction
<!-- ✍️ Write your own introduction here: what is the game, why you made this project, etc. -->

---

## Project Overview
This project is a command-line implementation of the card game *Oh Hell* (also known as *Boerenbridge*).  
The program allows multiple players to join, bid for tricks each round, track their scores automatically, and determine the winner at the end of the game.  

The game enforces the main rules of *Oh Hell*:  
- Players bid the number of tricks they expect to win.  
- The sum of bids in a round cannot equal the number of available tricks (to avoid perfect balance).  
- After the round is played, players record their actual tricks won.  
- Points are awarded or deducted based on how accurate the bid was.  

The game is played over a fixed number of rounds, after which the player(s) with the highest score is declared the winner.

---

## File Structure

- **`core.py`**  
  Contains the main game logic, including the `Game` and `Player` classes.  
  - `Game`: keeps track of players, number of rounds, and overall status.  
  - `Player`: represents each player with a name and score, including methods to update scores and represent the player as a string.  
  - Round logic, score calculation, and winner determination are also implemented here.

- **`helpers.py`**  
  Contains utility functions used throughout the game, such as:  
  - `parse_players`: ensures player names are valid and unique.  
  - `validate_rounds`: validates the number of rounds input.  
  - `clear_screen`: clears the terminal for readability.  
  - `wait_for_enter`: pauses execution until the player confirms.

- **`main.py`**  
  The entry point of the program. Initializes the game, handles user input, and manages the game loop. It also asks whether players want to play another game after finishing one.

- **`tests/`**  
  A directory containing unit tests (using `pytest`). These ensure the helper functions, score calculation, and core logic behave as expected.

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
- **Fairness rule enforcement**: The last player in each round cannot make a bid that makes the total sum equal to the number of tricks, to keep the game competitive.

---

## Installation & Running the Project

### Requirements
- Python 3.10+  
- (Optional) `pytest` for running the unit tests  
- `inflect` package for better English pluralization and natural joining of player names  

### Install dependencies
```bash
pip install -r requirements.txt
