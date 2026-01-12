/**
 * 클론다이크 솔리테어 - Vanilla JavaScript 구현
 */

class Klondike {
    constructor() {
        // 카드 상수
        this.SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
        this.SUIT_SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
        this.RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        // 게임 상태
        this.stock = [];           // 덱 (뒤집어진 카드)
        this.waste = [];           // 넘긴 카드
        this.foundations = { spades: [], hearts: [], diamonds: [], clubs: [] };
        this.tableaus = [[], [], [], [], [], [], []];  // 7개 열
        this.history = [];
        this.moves = 0;
        this.timerInterval = null;
        this.seconds = 0;

        // 드래그 상태
        this.isDragging = false;
        this.draggedCards = [];
        this.draggedSource = null;
        this.dragElements = [];
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.originalCardEls = [];

        // DOM 요소
        this.stockEl = document.getElementById('stock');
        this.wasteEl = document.getElementById('waste');
        this.timerEl = document.getElementById('timer');
        this.movesEl = document.getElementById('moves');
        this.winModal = document.getElementById('winModal');
        this.finalTimeEl = document.getElementById('finalTime');
        this.finalMovesEl = document.getElementById('finalMoves');

        // 이벤트 바인딩
        this.bindEvents();

        // 게임 시작
        this.newGame();
    }

    /**
     * 이벤트 리스너 바인딩
     */
    bindEvents() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.winModal.classList.add('hidden');
            this.newGame();
        });

        // 스톡 클릭
        this.stockEl.addEventListener('click', (e) => this.handleStockClick(e));

        // 드래그 앤 드롭 이벤트
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // 드래그 중 페이지 벗어나면 취소
        document.addEventListener('mouseleave', () => this.cancelDrag());
    }

    /**
     * 새 게임 시작
     */
    newGame() {
        this.cancelDrag();

        // 상태 초기화
        this.stock = [];
        this.waste = [];
        this.foundations = { spades: [], hearts: [], diamonds: [], clubs: [] };
        this.tableaus = [[], [], [], [], [], [], []];
        this.history = [];
        this.moves = 0;
        this.seconds = 0;

        // 덱 생성 및 셔플
        const deck = this.createDeck();
        this.shuffle(deck);

        // 테이블로에 카드 배분 (1, 2, 3, 4, 5, 6, 7장)
        let cardIndex = 0;
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = deck[cardIndex++];
                // 각 열의 마지막 카드만 앞면
                card.faceUp = (j === i);
                this.tableaus[j].push(card);
            }
        }

        // 나머지 카드는 스톡으로
        while (cardIndex < 52) {
            const card = deck[cardIndex++];
            card.faceUp = false;
            this.stock.push(card);
        }

        // UI 업데이트
        this.updateUI();
        this.updateMoves();
        this.startTimer();
    }

    /**
     * 카드 덱 생성
     */
    createDeck() {
        const deck = [];
        for (const suit of this.SUITS) {
            for (let rank = 0; rank < 13; rank++) {
                deck.push({ suit, rank, faceUp: false });
            }
        }
        return deck;
    }

    /**
     * Fisher-Yates 셔플
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * 카드가 빨간색인지 확인
     */
    isRed(card) {
        return card.suit === 'hearts' || card.suit === 'diamonds';
    }

    /**
     * 스톡 클릭 핸들러
     */
    handleStockClick(e) {
        // 드래그 시작과 충돌하지 않도록
        if (e.target.closest('.card')) return;

        const prevState = this.saveState();

        if (this.stock.length > 0) {
            // 스톡에서 웨이스트로 한 장 넘기기
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
        } else if (this.waste.length > 0) {
            // 웨이스트를 다시 스톡으로 (뒤집어서)
            while (this.waste.length > 0) {
                const card = this.waste.pop();
                card.faceUp = false;
                this.stock.push(card);
            }
        } else {
            return; // 아무 동작 없음
        }

        this.history.push(prevState);
        this.moves++;
        this.updateUI();
        this.updateMoves();
    }

    /**
     * 카드 HTML 생성
     */
    createCardElement(card, top = 0) {
        const div = document.createElement('div');

        if (!card.faceUp) {
            div.className = 'card face-down';
            div.style.top = `${top}px`;
            return div;
        }

        div.className = `card ${this.isRed(card) ? 'red' : 'black'}`;
        div.style.top = `${top}px`;
        div.dataset.suit = card.suit;
        div.dataset.rank = card.rank;

        const rankStr = this.RANKS[card.rank];
        const suitSymbol = this.SUIT_SYMBOLS[card.suit];

        div.innerHTML = `
            <div class="card-corner top-left">
                <span class="card-rank">${rankStr}</span>
                <span class="card-suit">${suitSymbol}</span>
            </div>
            <div class="card-center">${suitSymbol}</div>
            <div class="card-corner bottom-right">
                <span class="card-rank">${rankStr}</span>
                <span class="card-suit">${suitSymbol}</span>
            </div>
        `;

        return div;
    }

    /**
     * UI 전체 업데이트
     */
    updateUI() {
        // 스톡 업데이트
        this.stockEl.innerHTML = '';
        if (this.stock.length > 0) {
            this.stockEl.classList.remove('empty');
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            this.stockEl.appendChild(cardBack);
        } else {
            this.stockEl.classList.add('empty');
        }

        // 웨이스트 업데이트
        this.wasteEl.innerHTML = '';
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            const cardEl = this.createCardElement(topCard);
            cardEl.style.position = 'absolute';
            cardEl.style.left = '5px';
            cardEl.style.top = '5px';
            this.wasteEl.appendChild(cardEl);
        }

        // 파운데이션 업데이트
        document.querySelectorAll('.foundation').forEach((cell) => {
            const suit = cell.dataset.suit;
            const cards = this.foundations[suit];
            cell.innerHTML = '';
            if (cards.length > 0) {
                cell.appendChild(this.createCardElement(cards[cards.length - 1]));
            } else {
                cell.textContent = this.SUIT_SYMBOLS[suit];
            }
        });

        // 테이블로 업데이트
        document.querySelectorAll('.tableau').forEach((tableau, i) => {
            tableau.innerHTML = '';
            this.tableaus[i].forEach((card, j) => {
                const top = j * 25;
                tableau.appendChild(this.createCardElement(card, top));
            });
        });
    }

    /**
     * 마우스 다운 핸들러
     */
    handleMouseDown(e) {
        if (this.isDragging) return;

        const cardEl = e.target.closest('.card');
        if (!cardEl || cardEl.classList.contains('face-down')) return;

        const parent = cardEl.parentElement;
        if (!parent) return;

        // 소스 정보 추출
        const source = this.getCardSourceFromParent(parent, cardEl);
        if (!source) return;

        // 이동 가능한 카드들 가져오기
        const movableCards = this.getMovableCards(source);
        if (!movableCards || movableCards.length === 0) return;

        // 드래그 시작
        this.isDragging = true;
        this.draggedCards = movableCards;
        this.draggedSource = source;

        // 드래그용 임시 요소들 생성
        const rect = cardEl.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;

        this.dragElements = [];
        this.originalCardEls = [];

        movableCards.forEach((card, index) => {
            const dragEl = this.createCardElement(card, index * 25);
            dragEl.classList.add('dragging');
            dragEl.style.position = 'fixed';
            dragEl.style.left = `${e.clientX - this.dragOffsetX}px`;
            dragEl.style.top = `${e.clientY - this.dragOffsetY + index * 25}px`;
            dragEl.style.zIndex = `${1000 + index}`;
            dragEl.style.pointerEvents = 'none';
            document.body.appendChild(dragEl);
            this.dragElements.push(dragEl);
        });

        // 원본 카드들 반투명 처리
        if (source.type === 'tableau') {
            const tableauEl = parent;
            const cardEls = Array.from(tableauEl.children);
            for (let i = source.cardIndex; i < cardEls.length; i++) {
                cardEls[i].style.opacity = '0.3';
                this.originalCardEls.push(cardEls[i]);
            }
        } else {
            cardEl.style.opacity = '0.3';
            this.originalCardEls.push(cardEl);
        }

        this.highlightValidTargets();
        e.preventDefault();
    }

    /**
     * 이동 가능한 카드들 가져오기
     */
    getMovableCards(source) {
        if (source.type === 'waste') {
            if (this.waste.length === 0) return null;
            return [this.waste[this.waste.length - 1]];
        }

        if (source.type === 'foundation') {
            const cards = this.foundations[source.suit];
            if (cards.length === 0) return null;
            return [cards[cards.length - 1]];
        }

        if (source.type === 'tableau') {
            const tableau = this.tableaus[source.index];
            const sequence = tableau.slice(source.cardIndex);
            // 모든 카드가 앞면이어야 함
            if (sequence.every(c => c.faceUp)) {
                return sequence;
            }
        }

        return null;
    }

    /**
     * 부모 요소에서 소스 정보 추출
     */
    getCardSourceFromParent(parent, cardEl) {
        if (parent.id === 'waste') {
            return { type: 'waste' };
        }
        if (parent.classList.contains('foundation')) {
            return { type: 'foundation', suit: parent.dataset.suit };
        }
        if (parent.classList.contains('tableau')) {
            const tableauIndex = parseInt(parent.dataset.tableau);
            const cardIndex = Array.from(parent.children).indexOf(cardEl);
            return { type: 'tableau', index: tableauIndex, cardIndex };
        }
        return null;
    }

    /**
     * 마우스 이동 핸들러
     */
    handleMouseMove(e) {
        if (!this.isDragging || this.dragElements.length === 0) return;

        this.dragElements.forEach((dragEl, index) => {
            dragEl.style.left = `${e.clientX - this.dragOffsetX}px`;
            dragEl.style.top = `${e.clientY - this.dragOffsetY + index * 25}px`;
        });
    }

    /**
     * 마우스 업 핸들러
     */
    handleMouseUp(e) {
        if (!this.isDragging) return;

        this.clearHighlights();

        // 드롭 대상 찾기
        const dropTarget = this.findDropTargetWithSnap(e.clientX, e.clientY);

        if (dropTarget && this.tryMove(this.draggedSource, dropTarget, this.draggedCards)) {
            this.moves++;
            this.updateMoves();
            this.checkWin();
        }

        this.cleanupDrag();
        this.updateUI();
    }

    /**
     * 드래그 취소
     */
    cancelDrag() {
        if (!this.isDragging) return;
        this.clearHighlights();
        this.cleanupDrag();
        this.updateUI();
    }

    /**
     * 드래그 정리
     */
    cleanupDrag() {
        this.dragElements.forEach(dragEl => {
            if (dragEl && dragEl.parentNode) {
                dragEl.parentNode.removeChild(dragEl);
            }
        });

        this.originalCardEls.forEach(cardEl => {
            if (cardEl) {
                cardEl.style.opacity = '';
            }
        });

        this.isDragging = false;
        this.draggedCards = [];
        this.draggedSource = null;
        this.dragElements = [];
        this.originalCardEls = [];
    }

    /**
     * 유효한 이동 대상 하이라이트
     */
    highlightValidTargets() {
        if (!this.draggedCards || this.draggedCards.length === 0) return;

        const topCard = this.draggedCards[0];
        const cardCount = this.draggedCards.length;

        // 파운데이션 하이라이트 (단일 카드만)
        if (cardCount === 1) {
            document.querySelectorAll('.foundation').forEach((cell) => {
                const suit = cell.dataset.suit;
                if (this.canMoveToFoundation(topCard, suit)) {
                    cell.classList.add('highlight');
                }
            });
        }

        // 테이블로 하이라이트
        document.querySelectorAll('.tableau').forEach((tableau, i) => {
            if (this.draggedSource.type === 'tableau' && this.draggedSource.index === i) return;

            if (this.canMoveToTableau(topCard, i)) {
                tableau.classList.add('highlight');
            }
        });
    }

    /**
     * 하이라이트 제거
     */
    clearHighlights() {
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    }

    /**
     * 드롭 대상 찾기 (스냅 기능 포함)
     */
    findDropTargetWithSnap(x, y) {
        this.dragElements.forEach(el => {
            if (el) el.style.display = 'none';
        });

        let target = this.getTargetAtPoint(x, y);

        if (!target || !this.isValidTarget(target)) {
            const snapDistance = 60;
            const offsets = [
                [-snapDistance, 0], [snapDistance, 0],
                [0, -snapDistance], [0, snapDistance],
                [-snapDistance, -snapDistance], [snapDistance, -snapDistance],
                [-snapDistance, snapDistance], [snapDistance, snapDistance]
            ];

            for (const [dx, dy] of offsets) {
                const candidate = this.getTargetAtPoint(x + dx, y + dy);
                if (candidate && this.isValidTarget(candidate)) {
                    target = candidate;
                    break;
                }
            }
        }

        this.dragElements.forEach(el => {
            if (el) el.style.display = '';
        });

        return target;
    }

    /**
     * 특정 좌표에서 타겟 찾기
     */
    getTargetAtPoint(x, y) {
        const element = document.elementFromPoint(x, y);
        if (!element) return null;

        const foundation = element.closest('.foundation');
        if (foundation) {
            return { type: 'foundation', suit: foundation.dataset.suit };
        }

        const tableau = element.closest('.tableau');
        if (tableau) {
            return { type: 'tableau', index: parseInt(tableau.dataset.tableau) };
        }

        return null;
    }

    /**
     * 유효한 이동 대상인지 확인
     */
    isValidTarget(target) {
        if (!this.draggedCards || this.draggedCards.length === 0) return false;

        const topCard = this.draggedCards[0];
        const cardCount = this.draggedCards.length;

        switch (target.type) {
            case 'foundation':
                return cardCount === 1 && this.canMoveToFoundation(topCard, target.suit);
            case 'tableau':
                if (this.draggedSource.type === 'tableau' && this.draggedSource.index === target.index) {
                    return false;
                }
                return this.canMoveToTableau(topCard, target.index);
        }
        return false;
    }

    /**
     * 이동 시도
     */
    tryMove(source, target, cards) {
        if (!source || !target || !cards || cards.length === 0) return false;

        // 같은 위치면 무시
        if (source.type === target.type) {
            if (source.type === 'tableau' && source.index === target.index) return false;
            if (source.type === 'foundation' && source.suit === target.suit) return false;
        }

        const prevState = this.saveState();
        let success = false;

        switch (target.type) {
            case 'foundation':
                if (cards.length === 1) {
                    success = this.moveToFoundation(source, target.suit);
                }
                break;
            case 'tableau':
                success = this.moveToTableau(source, target.index, cards);
                break;
        }

        if (success) {
            this.history.push(prevState);
        }

        return success;
    }

    /**
     * 파운데이션으로 이동
     */
    moveToFoundation(source, targetSuit) {
        const card = this.getCardFromSource(source);
        if (!card) return false;
        if (!this.canMoveToFoundation(card, targetSuit)) return false;

        this.removeCardFromSource(source);
        this.foundations[targetSuit].push(card);
        this.flipTopCard(source);
        return true;
    }

    /**
     * 테이블로로 이동
     */
    moveToTableau(source, targetIndex, cards) {
        if (!cards || cards.length === 0) return false;

        const topCard = cards[0];
        if (!this.canMoveToTableau(topCard, targetIndex)) return false;

        // 소스에서 카드들 제거
        if (source.type === 'tableau') {
            this.tableaus[source.index].splice(source.cardIndex, cards.length);
            this.flipTopCard(source);
        } else if (source.type === 'waste') {
            this.waste.pop();
        } else if (source.type === 'foundation') {
            this.foundations[source.suit].pop();
        }

        // 타겟 테이블로에 카드들 추가
        this.tableaus[targetIndex].push(...cards);
        return true;
    }

    /**
     * 맨 위 카드 뒤집기 (테이블로)
     */
    flipTopCard(source) {
        if (source.type === 'tableau') {
            const tableau = this.tableaus[source.index];
            if (tableau.length > 0) {
                const topCard = tableau[tableau.length - 1];
                if (!topCard.faceUp) {
                    topCard.faceUp = true;
                }
            }
        }
    }

    /**
     * 파운데이션 이동 가능 여부
     */
    canMoveToFoundation(card, targetSuit) {
        if (card.suit !== targetSuit) return false;

        const foundation = this.foundations[targetSuit];
        if (foundation.length === 0) {
            return card.rank === 0; // A만 가능
        }
        return card.rank === foundation[foundation.length - 1].rank + 1;
    }

    /**
     * 테이블로 이동 가능 여부
     */
    canMoveToTableau(card, targetIndex) {
        const tableau = this.tableaus[targetIndex];
        if (tableau.length === 0) {
            return card.rank === 12; // K만 가능
        }

        const topCard = tableau[tableau.length - 1];
        if (!topCard.faceUp) return false;

        // 색이 다르고, 숫자가 1 작아야 함
        return this.isRed(card) !== this.isRed(topCard) && card.rank === topCard.rank - 1;
    }

    /**
     * 소스에서 카드 가져오기
     */
    getCardFromSource(source) {
        switch (source.type) {
            case 'waste':
                return this.waste[this.waste.length - 1];
            case 'foundation':
                const fCards = this.foundations[source.suit];
                return fCards[fCards.length - 1];
            case 'tableau':
                return this.tableaus[source.index][source.cardIndex];
        }
        return null;
    }

    /**
     * 소스에서 카드 제거
     */
    removeCardFromSource(source) {
        switch (source.type) {
            case 'waste':
                return this.waste.pop();
            case 'foundation':
                return this.foundations[source.suit].pop();
            case 'tableau':
                return this.tableaus[source.index].pop();
        }
        return null;
    }

    /**
     * 상태 저장
     */
    saveState() {
        return {
            stock: this.stock.map(c => ({ ...c })),
            waste: this.waste.map(c => ({ ...c })),
            foundations: {
                spades: this.foundations.spades.map(c => ({ ...c })),
                hearts: this.foundations.hearts.map(c => ({ ...c })),
                diamonds: this.foundations.diamonds.map(c => ({ ...c })),
                clubs: this.foundations.clubs.map(c => ({ ...c }))
            },
            tableaus: this.tableaus.map(t => t.map(c => ({ ...c }))),
            moves: this.moves
        };
    }

    /**
     * 실행 취소
     */
    undo() {
        if (this.history.length === 0) return;

        const prevState = this.history.pop();
        this.stock = prevState.stock;
        this.waste = prevState.waste;
        this.foundations = prevState.foundations;
        this.tableaus = prevState.tableaus;
        this.moves = prevState.moves;

        this.updateUI();
        this.updateMoves();
    }

    /**
     * 승리 확인
     */
    checkWin() {
        const total = Object.values(this.foundations).reduce((sum, f) => sum + f.length, 0);
        if (total === 52) {
            this.stopTimer();
            this.showWinModal();
            return true;
        }
        return false;
    }

    /**
     * 타이머 시작
     */
    startTimer() {
        this.stopTimer();
        this.seconds = 0;
        this.updateTimer();
        this.timerInterval = setInterval(() => {
            this.seconds++;
            this.updateTimer();
        }, 1000);
    }

    /**
     * 타이머 정지
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 타이머 업데이트
     */
    updateTimer() {
        const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const secs = (this.seconds % 60).toString().padStart(2, '0');
        this.timerEl.textContent = `${mins}:${secs}`;
    }

    /**
     * 이동 횟수 업데이트
     */
    updateMoves() {
        this.movesEl.textContent = this.moves;
    }

    /**
     * 승리 모달 표시
     */
    showWinModal() {
        this.finalTimeEl.textContent = this.timerEl.textContent;
        this.finalMovesEl.textContent = this.moves;
        this.winModal.classList.remove('hidden');
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new Klondike();
});
