import pytest
from helpers import join_names, parse_players, validate_rounds

def test_parse_players_basic():
    names = parse_players("Alice Bob Charlie")
    assert names == ["Alice", "Bob", "Charlie"]
    names = parse_players("alice bob charlie")
    assert names == ["Alice", "Bob", "Charlie"]
    names = parse_players("   Alice    Bob    Charlie   ")
    assert names == ["Alice", "Bob", "Charlie"]

def test_parse_players_invalid():
    with pytest.raises(ValueError):
        parse_players("Alice Bob")
    with pytest.raises(ValueError):
        parse_players("Alice Bob Charlie John Kate Tim Jim")
    with pytest.raises(ValueError):
        parse_players("Alice Alice")
    with pytest.raises(ValueError):
        parse_players("")

def test_join_names():
    assert join_names([]) == ""
    assert join_names(["Alice"]) == "Alice"
    assert join_names(["Alice", "Bob"]) == "Alice and Bob"
    assert join_names(["Alice", "Bob", "Charlie"]) == "Alice, Bob and Charlie"
    assert join_names(["Alice", "Bob", "Charlie", "David"]) == "Alice, Bob, Charlie and David"

def test_validate_rounds_valid():
    rounds = validate_rounds(5)
    assert rounds == 5

def test_validate_rounds_invalid():
    with pytest.raises(ValueError):
        validate_rounds(0)
