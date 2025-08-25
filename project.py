from helpers import parse_players, validate_rounds, wait_for_enter


class Game:
    def __init__(self, rounds, players):
        self._total_rounds = rounds
        self._rounds_left = rounds
        self._players = players

    @property
    def rounds_left(self):
        return self._rounds_left

    def decrement_round(self):
        if self._rounds_left > 0:
            self._rounds_left -= 1

    def __str__(self):
        player_info = ", ".join(str(player) for player in self._players)
        return (f"Game status:\nRounds left: {self._rounds_left}/{self._total_rounds}\n"
                f"Players: {player_info}")

    def player_names(self):
        """Print alleen de namen van de spelers, handig voor bids of overzicht"""
        return ", ".join(player.short_name() for player in self._players)

    @property
    def total_rounds(self):
        return self._total_rounds

    @property
    def players(self):
        return self._players


class Player:
    def __init__(self, name):
        self._name = name
        self._score = 0

    def __str__(self):
        """Mooie weergave voor wanneer je een speler print inclusief score"""
        return f"{self._name} (score: {self._score})"

    def short_name(self):
        """Alleen de naam, handig voor Game-lijsten of bids"""
        return self._name

    def update_score(self, points):
        self._score += points

    @property
    def name(self):
        return self._name

    @property
    def score(self):
        return self._score


def main():
    print("Hey! Ready to play Boerenbridge?\n________________________________\n")

    game = init_game()
    print(f"\n{game}\n")
    print("All set?")
    wait_for_enter()

    round_number = 1
    while game.rounds_left > 0:
        print(f"Round {round_number}\n")
        play_round(game, round_number)
        game.decrement_round()
        print(f"\n{game}\n________")
        round_number += 1


def init_game():
    names = parse_players(input("Please fill in the names of the players: "))
    players = [Player(name) for name in names]
    rounds = validate_rounds(int(input("How many rounds would you like to play?: ")))
    return Game(rounds, players)


def play_round(game, round_number):
    num_players = len(game.players)
    starting_index = (round_number - 1) % num_players
    ordered_players = game.players[starting_index:] + game.players[:starting_index]

    while True:
        try:
            tricks = int(input("With how many strokes do you wanna play? (Type 0 if you wanna skip this round) "))
            if tricks == 0:
                print(f"Round skipped! {game.rounds_left} round(s) left.")
                wait_for_enter()
                return

            if 1 <= tricks <= 10:
                break
            else:
                print("Please enter a number between 1 and 10.")
        except ValueError:
            print("Invalid input. Please enter a number.")
    print()

    bids = {}
    
    for i, player in enumerate(ordered_players):
        while True:
            try:
                bid = int(input(f"{player.name}, what is your guess? "))
                if bid < 0:
                    print("Cannot bid a negative number...")
                    continue
                
                if bid > tricks:
                    print("Cannot bid higher than the amount of strokes this round")
                    continue

                if i == (num_players - 1):
                    if (sum(bids.values()) + bid) == tricks:
                        print(f"Sorry {player.name}, you cannot make the total equal to {tricks}. Choose another number.")
                        continue

                break
            except ValueError:
                print("Invalid input. Please enter a number.")
        
        bids[player] = bid

    print(f"________\nOkay {ordered_players[0].name}, you can start!\n")
    wait_for_enter("Hit Enter when the round is played and you're ready to fill in the wins...\n")

    total_wins = {}

    for i, player in enumerate(ordered_players):
        while True:
            try:
                wins = int(input(f"{player.name}, how many strokes did you win? "))
                if wins < 0:
                    print("Cannot win a negative number...")
                    continue

                if wins > tricks:
                    print("Don't lie! Cannot win more than the amount of strokes this round")
                    continue

                if i == (num_players - 1):
                    if sum(total_wins.values()) + wins != tricks:
                        print(f"Sorry {player.name}, the total wins must equal the total strokes ({tricks}). Try again.")
                        continue

                break
            except ValueError:
                print("Invalid input. Please enter a number.")

        total_wins[player] = wins
        player.update_score(calculate_score(wins, bids[player]))
        

def calculate_score(wins, guess):
    score = 0

    if wins == guess:
        score += 10
        score += (wins * 2)
    else:
        score -= (abs(guess - wins) * 2)

    return score


if __name__ == "__main__":
    main()