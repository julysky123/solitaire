/**
 * 프리셀 게임 - Vanilla JavaScript 구현
 */

class FreeCell {
    constructor() {
        // 카드 상수
        this.SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
        this.SUIT_SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
        this.RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        // 게임 상태
        this.freeCells = [null, null, null, null];
        this.foundations = { spades: [], hearts: [], diamonds: [], clubs: [] };
        this.cascades = [[], [], [], [], [], [], [], []];
        this.history = [];
        this.moves = 0;
        this.timerInterval = null;
        this.seconds = 0;

        // 드래그 상태
        this.isDragging = false;
        this.draggedCard = null;      // 드래그 중인 카드 데이터
        this.draggedSource = null;    // 드래그 시작 위치 정보
        this.dragElement = null;      // 드래그용 임시 DOM 요소
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // DOM 요소
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
        document.getElementById('autoCompleteBtn').addEventListener('click', () => this.autoComplete());
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.winModal.classList.add('hidden');
            this.newGame();
        });

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
        // 드래그 취소
        this.cancelDrag();

        // 상태 초기화
        this.freeCells = [null, null, null, null];
        this.foundations = { spades: [], hearts: [], diamonds: [], clubs: [] };
        this.cascades = [[], [], [], [], [], [], [], []];
        this.history = [];
        this.moves = 0;
        this.seconds = 0;

        // 덱 생성 및 셔플
        const deck = this.createDeck();
        this.shuffle(deck);

        // 캐스케이드에 카드 배분
        for (let i = 0; i < 52; i++) {
            this.cascades[i % 8].push(deck[i]);
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
                deck.push({ suit, rank });
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
     * 카드 HTML 생성
     */
    createCardElement(card, top = 0) {
        const div = document.createElement('div');
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
        // 프리셀 업데이트
        document.querySelectorAll('.freecell').forEach((cell, i) => {
            cell.innerHTML = '';
            if (this.freeCells[i]) {
                cell.appendChild(this.createCardElement(this.freeCells[i]));
            }
        });

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

        // 캐스케이드 업데이트
        document.querySelectorAll('.cascade').forEach((cascade, i) => {
            cascade.innerHTML = '';
            this.cascades[i].forEach((card, j) => {
                cascade.appendChild(this.createCardElement(card, j * 25));
            });
        });
    }

    /**
     * 마우스 다운 핸들러
     */
    handleMouseDown(e) {
        if (this.isDragging) return;

        const cardEl = e.target.closest('.card');
        if (!cardEl) return;

        const parent = cardEl.parentElement;
        if (!parent) return;

        // 소스 정보 추출
        const source = this.getCardSourceFromParent(parent, cardEl);
        if (!source) return;

        // 이동 가능한 카드인지 확인
        if (!this.canSelectCard(source)) return;

        // 드래그 시작
        this.isDragging = true;
        this.draggedCard = this.getCardFromSource(source);
        this.draggedSource = source;

        // 드래그용 임시 요소 생성
        const rect = cardEl.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;

        this.dragElement = this.createCardElement(this.draggedCard);
        this.dragElement.classList.add('dragging');
        this.dragElement.style.position = 'fixed';
        this.dragElement.style.left = `${e.clientX - this.dragOffsetX}px`;
        this.dragElement.style.top = `${e.clientY - this.dragOffsetY}px`;
        this.dragElement.style.zIndex = '1000';
        this.dragElement.style.pointerEvents = 'none';
        document.body.appendChild(this.dragElement);

        // 원본 카드 반투명 처리
        cardEl.style.opacity = '0.3';
        this.originalCardEl = cardEl;

        this.highlightValidTargets();

        e.preventDefault();
    }

    /**
     * 부모 요소에서 소스 정보 추출
     */
    getCardSourceFromParent(parent, cardEl) {
        if (parent.classList.contains('freecell')) {
            return { type: 'freecell', index: parseInt(parent.dataset.cell) };
        }
        if (parent.classList.contains('foundation')) {
            return { type: 'foundation', suit: parent.dataset.suit };
        }
        if (parent.classList.contains('cascade')) {
            const cascadeIndex = parseInt(parent.dataset.cascade);
            const cardIndex = Array.from(parent.children).indexOf(cardEl);
            return { type: 'cascade', index: cascadeIndex, cardIndex };
        }
        return null;
    }

    /**
     * 마우스 이동 핸들러
     */
    handleMouseMove(e) {
        if (!this.isDragging || !this.dragElement) return;

        this.dragElement.style.left = `${e.clientX - this.dragOffsetX}px`;
        this.dragElement.style.top = `${e.clientY - this.dragOffsetY}px`;
    }

    /**
     * 마우스 업 핸들러
     */
    handleMouseUp(e) {
        if (!this.isDragging) return;

        this.clearHighlights();

        // 드롭 대상 찾기 (스냅 기능 포함)
        const dropTarget = this.findDropTargetWithSnap(e.clientX, e.clientY);

        if (dropTarget && this.tryMove(this.draggedSource, dropTarget)) {
            // 이동 성공
            this.moves++;
            this.updateMoves();
            this.checkWin();
        }

        // 드래그 정리 및 UI 업데이트
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
        // 드래그 요소 제거
        if (this.dragElement && this.dragElement.parentNode) {
            this.dragElement.parentNode.removeChild(this.dragElement);
        }

        // 원본 카드 복원
        if (this.originalCardEl) {
            this.originalCardEl.style.opacity = '';
        }

        // 상태 초기화
        this.isDragging = false;
        this.draggedCard = null;
        this.draggedSource = null;
        this.dragElement = null;
        this.originalCardEl = null;
    }

    /**
     * 소스에서 카드 가져오기
     */
    getCardFromSource(source) {
        switch (source.type) {
            case 'freecell':
                return this.freeCells[source.index];
            case 'foundation':
                const fCards = this.foundations[source.suit];
                return fCards[fCards.length - 1];
            case 'cascade':
                return this.cascades[source.index][source.cardIndex];
        }
        return null;
    }

    /**
     * 카드 선택 가능 여부
     */
    canSelectCard(source) {
        if (source.type === 'freecell') {
            return this.freeCells[source.index] !== null;
        }
        if (source.type === 'foundation') {
            return false; // 파운데이션에서는 가져올 수 없음
        }
        if (source.type === 'cascade') {
            const cascade = this.cascades[source.index];
            // 맨 아래 카드만 이동 가능 (단일 카드 이동)
            return source.cardIndex === cascade.length - 1;
        }
        return false;
    }

    /**
     * 유효한 이동 대상 하이라이트
     */
    highlightValidTargets() {
        if (!this.draggedCard) return;

        // 프리셀 하이라이트
        document.querySelectorAll('.freecell').forEach((cell, i) => {
            if (this.freeCells[i] === null) {
                cell.classList.add('highlight');
            }
        });

        // 파운데이션 하이라이트
        document.querySelectorAll('.foundation').forEach((cell) => {
            const suit = cell.dataset.suit;
            if (this.canMoveToFoundation(this.draggedCard, suit)) {
                cell.classList.add('highlight');
            }
        });

        // 캐스케이드 하이라이트
        document.querySelectorAll('.cascade').forEach((cascade, i) => {
            if (this.canMoveToCascade(this.draggedCard, i)) {
                cascade.classList.add('highlight');
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
        // 드래그 요소 임시 숨김
        if (this.dragElement) {
            this.dragElement.style.display = 'none';
        }

        // 먼저 정확한 위치 확인
        let target = this.getTargetAtPoint(x, y);

        // 정확한 위치에 없으면 주변 검색 (스냅)
        if (!target) {
            const snapDistance = 60; // 스냅 거리 (픽셀)
            const offsets = [
                [0, 0],
                [-snapDistance, 0], [snapDistance, 0],
                [0, -snapDistance], [0, snapDistance],
                [-snapDistance, -snapDistance], [snapDistance, -snapDistance],
                [-snapDistance, snapDistance], [snapDistance, snapDistance]
            ];

            for (const [dx, dy] of offsets) {
                target = this.getTargetAtPoint(x + dx, y + dy);
                if (target && this.isValidTarget(target)) {
                    break;
                }
                target = null;
            }
        }

        if (this.dragElement) {
            this.dragElement.style.display = '';
        }

        return target;
    }

    /**
     * 특정 좌표에서 타겟 찾기
     */
    getTargetAtPoint(x, y) {
        const element = document.elementFromPoint(x, y);
        if (!element) return null;

        // 프리셀
        const freecell = element.closest('.freecell');
        if (freecell) {
            return { type: 'freecell', index: parseInt(freecell.dataset.cell) };
        }

        // 파운데이션
        const foundation = element.closest('.foundation');
        if (foundation) {
            return { type: 'foundation', suit: foundation.dataset.suit };
        }

        // 캐스케이드
        const cascade = element.closest('.cascade');
        if (cascade) {
            return { type: 'cascade', index: parseInt(cascade.dataset.cascade) };
        }

        return null;
    }

    /**
     * 유효한 이동 대상인지 확인
     */
    isValidTarget(target) {
        if (!this.draggedCard) return false;

        switch (target.type) {
            case 'freecell':
                return this.freeCells[target.index] === null;
            case 'foundation':
                return this.canMoveToFoundation(this.draggedCard, target.suit);
            case 'cascade':
                return this.canMoveToCascade(this.draggedCard, target.index);
        }
        return false;
    }

    /**
     * 이동 시도
     */
    tryMove(source, target) {
        if (!source || !target) return false;

        const card = this.getCardFromSource(source);
        if (!card) return false;

        // 같은 위치면 무시
        if (source.type === target.type) {
            if (source.type === 'freecell' && source.index === target.index) return false;
            if (source.type === 'cascade' && source.index === target.index) return false;
        }

        let success = false;

        // 이동 전 상태 저장 (undo용)
        const prevState = this.saveState();

        // 대상별 이동 로직
        switch (target.type) {
            case 'freecell':
                success = this.moveToFreeCell(source, target.index);
                break;
            case 'foundation':
                success = this.moveToFoundation(source, target.suit);
                break;
            case 'cascade':
                success = this.moveToCascade(source, target.index);
                break;
        }

        if (success) {
            this.history.push(prevState);
        }

        return success;
    }

    /**
     * 프리셀로 이동
     */
    moveToFreeCell(source, targetIndex) {
        if (this.freeCells[targetIndex] !== null) return false;

        const card = this.removeCardFromSource(source);
        if (!card) return false;

        this.freeCells[targetIndex] = card;
        return true;
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
        return true;
    }

    /**
     * 캐스케이드로 이동
     */
    moveToCascade(source, targetIndex) {
        const card = this.getCardFromSource(source);
        if (!card) return false;
        if (!this.canMoveToCascade(card, targetIndex)) return false;

        this.removeCardFromSource(source);
        this.cascades[targetIndex].push(card);
        return true;
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
     * 캐스케이드 이동 가능 여부
     */
    canMoveToCascade(card, targetIndex) {
        const cascade = this.cascades[targetIndex];
        if (cascade.length === 0) return true;

        const topCard = cascade[cascade.length - 1];
        // 색이 다르고, 숫자가 1 작아야 함
        return this.isRed(card) !== this.isRed(topCard) && card.rank === topCard.rank - 1;
    }

    /**
     * 소스에서 카드 제거
     */
    removeCardFromSource(source) {
        switch (source.type) {
            case 'freecell':
                const card = this.freeCells[source.index];
                this.freeCells[source.index] = null;
                return card;
            case 'foundation':
                return this.foundations[source.suit].pop();
            case 'cascade':
                return this.cascades[source.index].pop();
        }
        return null;
    }

    /**
     * 상태 저장
     */
    saveState() {
        return {
            freeCells: [...this.freeCells],
            foundations: {
                spades: [...this.foundations.spades],
                hearts: [...this.foundations.hearts],
                diamonds: [...this.foundations.diamonds],
                clubs: [...this.foundations.clubs]
            },
            cascades: this.cascades.map(c => [...c]),
            moves: this.moves
        };
    }

    /**
     * 실행 취소
     */
    undo() {
        if (this.history.length === 0) return;

        const prevState = this.history.pop();
        this.freeCells = prevState.freeCells;
        this.foundations = prevState.foundations;
        this.cascades = prevState.cascades;
        this.moves = prevState.moves;

        this.updateUI();
        this.updateMoves();
    }

    /**
     * 자동 완성
     */
    autoComplete() {
        const autoMove = () => {
            // 각 위치에서 파운데이션으로 이동 가능한 카드 찾기
            let moved = false;

            // 프리셀 확인
            for (let i = 0; i < 4; i++) {
                const card = this.freeCells[i];
                if (card) {
                    for (const suit of this.SUITS) {
                        if (this.canMoveToFoundation(card, suit)) {
                            const prevState = this.saveState();
                            this.freeCells[i] = null;
                            this.foundations[suit].push(card);
                            this.history.push(prevState);
                            this.moves++;
                            moved = true;
                            break;
                        }
                    }
                }
                if (moved) break;
            }

            // 캐스케이드 확인
            if (!moved) {
                for (let i = 0; i < 8; i++) {
                    const cascade = this.cascades[i];
                    if (cascade.length > 0) {
                        const card = cascade[cascade.length - 1];
                        if (this.canMoveToFoundation(card, card.suit)) {
                            const prevState = this.saveState();
                            cascade.pop();
                            this.foundations[card.suit].push(card);
                            this.history.push(prevState);
                            this.moves++;
                            moved = true;
                            break;
                        }
                    }
                }
            }

            this.updateUI();
            this.updateMoves();

            if (moved && !this.checkWin()) {
                setTimeout(autoMove, 200);
            }
        };

        autoMove();
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
    new FreeCell();
});
