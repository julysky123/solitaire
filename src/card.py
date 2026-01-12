"""카드 게임을 위한 Card 클래스 모듈."""

from typing import List


class Card:
    """플레잉 카드를 나타내는 클래스.

    Attributes:
        SUITS: 사용 가능한 카드 문양 목록
        RANKS: 사용 가능한 카드 숫자 목록
        suit: 카드의 문양
        rank: 카드의 숫자
    """

    SUITS: List[str] = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
    RANKS: List[str] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    def __init__(self, suit: str, rank: str) -> None:
        """Card 객체를 생성합니다.

        Args:
            suit: 카드 문양 (Hearts, Diamonds, Clubs, Spades)
            rank: 카드 숫자 (A, 2-10, J, Q, K)
        """
        self.suit = suit
        self.rank = rank

    def __str__(self) -> str:
        """카드의 문자열 표현을 반환합니다."""
        return f"{self.rank} of {self.suit}"

    def __repr__(self) -> str:
        """카드의 공식 문자열 표현을 반환합니다."""
        return f"Card('{self.suit}', '{self.rank}')"

    def is_red(self) -> bool:
        """카드가 빨간색인지 확인합니다.

        Returns:
            Hearts 또는 Diamonds면 True, 아니면 False
        """
        return self.suit in ['Hearts', 'Diamonds']

    def is_black(self) -> bool:
        """카드가 검은색인지 확인합니다.

        Returns:
            Clubs 또는 Spades면 True, 아니면 False
        """
        return self.suit in ['Clubs', 'Spades']
