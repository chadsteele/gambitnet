"""Minimal benchmark harness for comparing piece-team coordination."""
from dataclasses import dataclass

@dataclass
class MatchScore:
    winner: str
    moves: int
    cooperation_events: int

def score_match(winner: str, moves: int, cooperation_events: int) -> MatchScore:
    """Return a serializable baseline score for a completed match."""
    return MatchScore(winner=winner, moves=moves, cooperation_events=cooperation_events)

if __name__ == "__main__":
    print(score_match("draw", 0, 0))
