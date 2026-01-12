class Card:
    SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
    RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    def __init__(self, suit, rank):
        self.suit = suit
        self.rank = rank

    def __str__(self):
        return f"{self.rank} of {self.suit}"

    def __repr__(self):
        return f"Card('{self.suit}', '{self.rank}')"

    def is_red(self):
        return self.suit in ['Hearts', 'Diamonds']

    def is_black(self):
        return self.suit in ['Clubs', 'Spades']
