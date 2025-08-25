import os


def parse_players(str_players, min_players=3, max_players=6):
    names = str_players.title().strip().split()
    
    if not names:
        raise ValueError("No player names provided.")

    if len(names) < min_players:
        raise ValueError(f"You need at least {min_players} players to start the game.")

    if len(names) > max_players:
        raise ValueError(f"You can have at most {max_players} players.")

    if len(names) != len(set(names)):
        raise ValueError("Duplicate player names are not allowed.")

    return names
    

def validate_rounds(rounds):
    if not 1 <= rounds <= 19:
        raise ValueError("Amount of rounds must be between 1 and 19")
    
    return rounds


def wait_for_enter(message="Press Enter to continue..."):
    input(message)
    clear_screen()


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')