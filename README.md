# Oh Hell Scorekeeper
#### Video Demo: <URL HERE>
#### Description:
A scorekeeper for the card game *Oh Hell*, made as a final project for the CS50’s Introduction to Programming with Python course from Harvard.

## Introduction
I often play the card game *Oh Hell* (known as *Boerenbridge* in Dutch) with my family. We traditionally keep score with pen and paper. So I thought: why not use this CS50p final project as an opportunity to build a small program for this...

---

## Project Overview
This project is a command-line scorekeeper for the card game *Oh Hell*.
For information about the game itself I would like to link to: https://en.wikipedia.org/wiki/Oh_hell

The program enforces the main rules of *Oh Hell*, a short summary of the flow:
- It starts by initialising the amount of rounds and players.  
- Players bid the number of tricks they expect to win.  
- The sum of bids in a round cannot equal the number of available tricks (to avoid perfect balance).  
- After the round is played, players record their actual tricks won.
- Points are awarded or deducted based on how accurate the bid was.  
- After all rounds are played a winner is determined and the user is asked to play again.

---

## File Structure

- **`project.py`**  
  Contains the main game logic, including the `Game` and `Player` classes.  
  - `Game`: keeps track of players, number of rounds, and overall status.  
  - `Player`: represents each player with a name and score, including methods to update scores and represent the player as a string.  
  - Initialisation and round logic, score calculation, and winner determination are also implemented here.

- **`helpers.py`**  
  Contains utility functions used throughout the game, such as:  
  - `parse_players`: ensures player names are valid and unique.  
  - `validate_rounds`: validates the number of rounds input.  
  - `clear_screen`: clears the terminal for readability.  
  - `wait_for_enter`: pauses execution until the player confirms.

- **`test_project.py`**  
  A directory containing unit tests (using `pytest`). These test some of the functions in project.py.

- **`test_helpers.py`**  
  A directory containing unit tests (using `pytest`). These ensure the helper functions, score calculation, and core logic behave as expected.

- **`requirements.txt`**  
  Contains the required libraries.

---

## Scoring Rules

- Exact bid: **10 points + (2 × tricks won)**  
- Incorrect bid: **–2 points for each trick off the guess**

For example:  
- If a player bids 3 and wins 3 → they earn 16 points.  
- If a player bids 2 and wins 5 → they lose 6 points.  

---

## Design Decisions

- **Class-based design**: `Game` and `Player` classes make the logic more modular, so features (like undo/redo or saving scores) can be added later without rewriting the whole game. I am also used to OOP via my Java backend projects. 
- **Command-line interface**: Chosen for simplicity and focus on gameplay logic. The project could later be extended into a GUI or web app.  
- **Validation checks**: User input is validated at every step (bids, wins, rounds, player names) to reduce errors during gameplay.  
- **Some allowed flexability**: I tried to implement some checks and balances via try-blocks. Also the user is allowed to redo or skip a round.

---

## Installation & Running the Project

### Requirements
- Python 3.10+  
- (Optional) `pytest` for running the unit tests  
- `inflect` package for better English pluralisation and natural joining of player names  

### Install dependencies
```bash
pip install -r requirements.txt
```
### Run the game
```bash
python project.py
```
### Run the tests
```bash
pytest test_project.py test_helpers.py
```

## Future Improvements
- Add undo/redo feature for mistakes during input.
- Save and load past games from file (score history).
- Show some more game information (round history, player positions etc.)
- Create a GUI or web version for a better user experience.

## How to Contribute
This project was built as a personal/family tool, but contributions are welcome.  
Feel free to open issues or submit pull requests to improve the gameplay, add features, or fix bugs.
