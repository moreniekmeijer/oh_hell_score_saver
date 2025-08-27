from project import Game, Player

def test_player_initialization():
    p = Player("Alice")
    assert p.name == "Alice"
    assert p.score == 0

def test_player_update_score_correct_guess():
    p = Player("Alice")
    p.update_score(wins=3, bid=3)
    assert p.score == 16

def test_player_update_score_incorrect_guess():
    p = Player("Alice")
    p.update_score(wins=2, bid=4)
    assert p.score == -4

def test_game_initialization():
    players = [Player("Alice"), Player("Bob")]
    g = Game(rounds=5, players=players)

    assert g.total_rounds == 5
    assert g.rounds_left == 5
    assert len(g.players) == 2

    leaderboard = g.leaderboard
    assert leaderboard[0].score == 0
    assert leaderboard[1].score == 0
