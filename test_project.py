from project import Game, Player, calculate_score

def test_player():
    p = Player("Alice")
    assert p.score == 0
    p.update_score(5)
    assert p.score == 5
    assert p.short_name() == "Alice"

def test_calculate_score_correct_guess():
    score = calculate_score(3, 3)
    assert score == 10 + 3 * 2

def test_calculate_score_incorrect_guess():
    score = calculate_score(2, 4)
    assert score == -(abs(2 - 4) * 2)

def test_game_initialization():
    players = [Player("Alice"), Player("Bob")]
    g = Game(rounds=5, players=players)
    assert g.total_rounds == 5
    assert g.rounds_left == 5
    assert len(g.players) == 2

