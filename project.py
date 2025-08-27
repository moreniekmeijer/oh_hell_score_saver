from helpers import clear_screen, join_names, parse_players, validate_rounds, wait_for_enter


class Game:
    def __init__(self, rounds, players):
        self._total_rounds = rounds
        self._rounds_left = rounds
        self._players = players

    def __str__(self):
        player_info = ", ".join(str(player) for player in self._players)
        return (f"Game status:\nRounds left: {self._rounds_left}/{self._total_rounds}\n"
                f"Players: {player_info}")
    
    def decrement_round(self):
        if self._rounds_left > 0:
            self._rounds_left -= 1

    @property
    def leaderboard(self):
        return sorted(self._players, key=lambda p: p.score, reverse=True)

    def show_leaderboard(self):
        print("\nCurrent standings:")
        for id, player in enumerate(self.leaderboard, start=1):
            print(f"{id}. {player.name} ({player.score} points)")
        print()

    def winners(self):
        max_score = self.leaderboard[0].score
        winners = [p for p in self._players if p.score == max_score]
        return winners, max_score

    @property
    def total_rounds(self):
        return self._total_rounds
    
    @property
    def rounds_left(self):
        return self._rounds_left

    @property
    def players(self):
        return self._players


class Player:
    def __init__(self, name):
        self._name = name
        self._score = 0

    def __str__(self):
        return f"{self._name} (score: {self._score})"

    def update_score(self, wins, bid):
        if wins == bid:
            self._score += 10 + (wins * 2)
        else:
            self._score -= abs(bid - wins) * 2

    @property
    def name(self):
        return self._name

    @property
    def score(self):
        return self._score


def main():
    print("Hey! Ready to play Oh Hell?\n________________________________\n")

    while True:
        play_game()

        again = input("Would you like to play another game? (y/n): ").strip().lower()
        if again != "y":
            print("Thanks for playing! Goodbye.\n")
            break


def play_game():
    game = init_game()
    print(f"\n{game}\n")
    
    while True:
        choice = input("All set? (y/n): ").strip().lower()
        if choice == "y":
            break
        elif choice == "n":
            print("Let's start over!\n")
            return play_game()
        else:
            print("Please type 'y' to continue or 'n' to start a new game.")

    clear_screen()

    round_number = 1
    while game.rounds_left > 0:
        print(f"Round {round_number}\n")

        result = play_round(game, round_number)

        if result == "redo":
            continue

        game.decrement_round()
        game.show_leaderboard()
        round_number += 1

    winners, score = game.winners()
    names = [player.name for player in winners]
    names_str = join_names(names)
    print(f"It's a tie between {names_str} with {score} points each!\n")


def init_game():
    while True:
        try:
            raw_names = input("Please fill in the names of the players (separated by spaces): ")
            names = parse_players(raw_names)
            players = [Player(name) for name in names]
            break
        except ValueError as e:
            print(f"Invalid input: {e}\nPlease try again.\n")

    while True:
        try:
            rounds = int(input("How many rounds would you like to play?: "))
            rounds = validate_rounds(rounds)
            break
        except ValueError:
            print("Invalid input. Please enter a valid number of rounds.\n")

    return Game(rounds, players)


def play_round(game, round_number):
    num_players = len(game.players)
    starting_index = (round_number - 1) % num_players
    ordered_players = game.players[starting_index:] + game.players[:starting_index]

    while True:
        try:
            tricks = int(input("With how many tricks do you wanna play? (Type 0 if you wanna skip this round) "))
            if tricks == 0:
                print(f"Round skipped! {game.rounds_left - 1} round(s) left.")
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
                bid = int(input(f"{player.name}, what is your bid? "))
                if bid < 0:
                    print("Cannot bid a negative number...")
                    continue
                
                if bid > tricks:
                    print("Cannot bid higher than the amount of tricks this round")
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
    wait_for_enter("Hit Enter when the round is played and you're ready to fill in the trick wins...\n")

    total_wins = {}

    for i, player in enumerate(ordered_players):
        while True:
            try:
                wins = int(input(f"{player.name}, how many tricks did you win? "))
                if wins < 0:
                    print("Cannot win a negative number...")
                    continue

                if wins > tricks:
                    print("Don't lie! Cannot win more than the amount of tricks this round")
                    continue

                if i == (num_players - 1):
                    if sum(total_wins.values()) + wins != tricks:
                        print(f"Sorry {player.name}, the total wins must equal the total tricks ({tricks}).")
                        redo = input("Type 'r' to redo the whole round, or Enter to try again: ").strip().lower()
                        if redo == "r":
                            print("\nRound will be restarted!\n")
                            return "redo"
                        else:
                            continue

                break
            except ValueError:
                print("Invalid input. Please enter a number.")

        total_wins[player] = wins

    for player in ordered_players:
        wins = total_wins[player]
        bid = bids[player]
        player.update_score(wins, bid)


if __name__ == "__main__":
    main()