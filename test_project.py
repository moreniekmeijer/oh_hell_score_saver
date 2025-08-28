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

def test_game_str_and_decrement_round():
    players = [Player("Alice"), Player("Bob")]
    g = Game(rounds=3, players=players)

    s = str(g)
    assert "Rounds left" in s
    assert "Alice" in s
    assert "Bob" in s

    g.decrement_round()
    assert g.rounds_left == 2

def test_game_leaderboard_sorting():
    a = Player("Alice")
    b = Player("Bob")
    a.update_score(2, 2)
    b.update_score(1, 0)
    g = Game(rounds=1, players=[a, b])

    leaderboard = g.leaderboard
    assert leaderboard[0].name == "Alice"
    assert leaderboard[1].name == "Bob"

def test_show_leaderboard_output(capfd):
    a = Player("Alice")
    b = Player("Bob")
    a.update_score(1, 1)
    g = Game(rounds=1, players=[a, b])

    g.show_leaderboard()
    captured = capfd.readouterr()
    assert "Alice" in captured.out
    assert "Bob" in captured.out
    assert "12" in captured.out

def test_winners_single_and_tie():
    a = Player("Alice")
    b = Player("Bob")

    a.update_score(2, 2)
    b.update_score(2, 2)
    g = Game(rounds=1, players=[a, b])

    winners, score = g.winners()
    assert len(winners) == 2
    assert score == 14

    a.update_score(1, 1)
    winners, score = g.winners()
    assert len(winners) == 1
    assert winners[0].name == "Alice"
    assert score == 26