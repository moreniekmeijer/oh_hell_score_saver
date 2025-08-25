from helpers import parse_players, validate_rounds


class Game:
    def __init__(self, rounds, players):
        self._rounds = rounds
        self._players = players

    def __str__(self):
        return f"Players: {len(self._players)}\nRounds: {self._rounds}"
    
    @property
    def rounds(self):
        return self._rounds
    
    @rounds.setter
    def rounds(self, value):
        self._rounds = value

    @property
    def players(self):
        return self._players

    @players.setter
    def players(self, value):
        self._players = value


class Player:
    def __init__(self, name):
        self._name = name
        self._score = 0

    def __str__(self):
        return f"{self._name}"

    def update_score(self, points):
        self._score += points

    @property
    def score(self):
        return self._score


def main():
    print("Hey! Ready to play Boerenbridge?\n________________________________\n")

    game = init_game()
    print(f"______\n{game}\n______")
    print("Okay?.. Let's go!\n")

    for round_number in range(1, game.rounds + 1):
        print(f"Round {round_number}")
        play_round(game, round_number)

    for player in game.players:
        print(player.score)


def init_game():
    names = parse_players(input("Please fill in the names of the players: "))
    players = [Player(name) for name in names]
    rounds = validate_rounds(int(input("How many rounds would you like to play?: ")))
    return Game(rounds, players)


def play_round(game, round_number):
    num_players = len(game.players)
    starting_index = (round_number - 1) % num_players
    ordered_players = game.players[starting_index:] + game.players[:starting_index]

    guesses = {}
    
    for player in ordered_players:
        guess = int(input(f"{player}, what is your quess? "))
        guesses[player] = guess

    print(f"Okay {player}, you can start!")

    for player in ordered_players:
        wins = int(input(f"{player}, how many rounds did you win? "))
    
        player.update_score(calculate_score(wins, guesses[player]))


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