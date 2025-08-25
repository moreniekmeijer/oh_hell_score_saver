def parse_players(str_players):
    try:
        return str_players.title().strip().split(" ")
    except:
        return ValueError("")
    

def validate_rounds(rounds):
    if not 1 <= rounds <= 19:
        return ValueError("Amount of rounds must be between 1 and 19")
    return rounds