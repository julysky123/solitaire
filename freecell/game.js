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
        this.draggedCards = [];       // 드래그 중인 카드들 (다중 카드 지원)
        this.draggedSource = null;    // 드래그 시작 위치 정보
        this.dragElements = [];       // 드래그용 임시 DOM 요소들
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.originalCardEls = [];    // 원본 카드 요소들

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
     * 빈 프리셀 개수
     */
    getEmptyFreeCellCount() {
        return this.freeCells.filter(c => c === null).length;
    }

    /**
     * 빈 캐스케이드 개수
     */
    getEmptyCascadeCount() {
        return this.cascades.filter(c => c.length === 0).length;
    }

    /**
     * 최대 이동 가능 카드 수 (슈퍼무브)
     * 공식: (빈 프리셀 + 1) * 2^(빈 캐스케이드) 또는 간단히 (빈 프리셀 + 1) * (빈 캐스케이드 + 1)
     */
    getMaxMovableCards(toEmptyCascade = false) {
        const emptyFreeCells = this.getEmptyFreeCellCount();
        // 빈 캐스케이드로 이동할 때는 해당 캐스케이드 제외
        const emptyCascades = this.getEmptyCascadeCount() - (toEmptyCascade ? 1 : 0);
        return (emptyFreeCells + 1) * (emptyCascades + 1);
    }

    /**
     * 카드 시퀀스가 유효한지 확인 (색 교대, 내림차순)
     */
    isValidSequence(cards) {
        if (cards.length <= 1) return true;

        for (let i = 0; i < cards.length - 1; i++) {
            const current = cards[i];
            const next = cards[i + 1];
            // 색이 달라야 하고, 순서가 1씩 내려가야 함
            if (this.isRed(current) === this.isRed(next)) return false;
            if (current.rank !== next.rank + 1) return false;
        }
        return true;
    }

    /**
     * 캐스케이드에서 특정 위치부터 끝까지의 유효한 시퀀스 가져오기
     */
    getSequenceFromIndex(cascadeIndex, cardIndex) {
        const cascade = this.cascades[cascadeIndex];
        const sequence = cascade.slice(cardIndex);

        if (this.isValidSequence(sequence)) {
            return sequence;
        }
        return null;
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

        // 여러 카드를 쌓아서 표시
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
        if (source.type === 'cascade') {
            const cascadeEl = parent;
            const cardEls = Array.from(cascadeEl.children);
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
        if (source.type === 'freecell') {
            const card = this.freeCells[source.index];
            return card ? [card] : null;
        }

        if (source.type === 'foundation') {
            return null; // 파운데이션에서는 가져올 수 없음
        }

        if (source.type === 'cascade') {
            const sequence = this.getSequenceFromIndex(source.index, source.cardIndex);
            return sequence;
        }

        return null;
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

        // 드롭 대상 찾기 (스냅 기능 포함)
        const dropTarget = this.findDropTargetWithSnap(e.clientX, e.clientY);

        if (dropTarget && this.tryMove(this.draggedSource, dropTarget, this.draggedCards)) {
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
        // 드래그 요소들 제거
        this.dragElements.forEach(dragEl => {
            if (dragEl && dragEl.parentNode) {
                dragEl.parentNode.removeChild(dragEl);
            }
        });

        // 원본 카드들 복원
        this.originalCardEls.forEach(cardEl => {
            if (cardEl) {
                cardEl.style.opacity = '';
            }
        });

        // 상태 초기화
        this.isDragging = false;
        this.draggedCards = [];
        this.draggedSource = null;
        this.dragElements = [];
        this.originalCardEls = [];
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
     * 유효한 이동 대상 하이라이트
     */
    highlightValidTargets() {
        if (!this.draggedCards || this.draggedCards.length === 0) return;

        const topCard = this.draggedCards[0]; // 이동할 카드들 중 맨 위 카드
        const cardCount = this.draggedCards.length;

        // 프리셀 하이라이트 (단일 카드만)
        if (cardCount === 1) {
            document.querySelectorAll('.freecell').forEach((cell, i) => {
                if (this.freeCells[i] === null) {
                    cell.classList.add('highlight');
                }
            });
        }

        // 파운데이션 하이라이트 (단일 카드만)
        if (cardCount === 1) {
            document.querySelectorAll('.foundation').forEach((cell) => {
                const suit = cell.dataset.suit;
                if (this.canMoveToFoundation(topCard, suit)) {
                    cell.classList.add('highlight');
                }
            });
        }

        // 캐스케이드 하이라이트
        document.querySelectorAll('.cascade').forEach((cascade, i) => {
            // 같은 캐스케이드면 스킵
            if (this.draggedSource.type === 'cascade' && this.draggedSource.index === i) return;

            const targetCascade = this.cascades[i];
            const toEmpty = targetCascade.length === 0;
            const maxMovable = this.getMaxMovableCards(toEmpty);

            // 카드 수가 이동 가능 수 이하이고, 타겟에 놓을 수 있으면 하이라이트
            if (cardCount <= maxMovable && this.canMoveToCascade(topCard, i)) {
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
        // 드래그 요소들 임시 숨김
        this.dragElements.forEach(el => {
            if (el) el.style.display = 'none';
        });

        // 먼저 정확한 위치 확인
        let target = this.getTargetAtPoint(x, y);

        // 정확한 위치에 없으면 주변 검색 (스냅)
        if (!target || !this.isValidTarget(target)) {
            const snapDistance = 60; // 스냅 거리 (픽셀)
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

        // 드래그 요소들 다시 표시
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
        if (!this.draggedCards || this.draggedCards.length === 0) return false;

        const topCard = this.draggedCards[0];
        const cardCount = this.draggedCards.length;

        switch (target.type) {
            case 'freecell':
                return cardCount === 1 && this.freeCells[target.index] === null;
            case 'foundation':
                return cardCount === 1 && this.canMoveToFoundation(topCard, target.suit);
            case 'cascade':
                // 같은 캐스케이드면 무효
                if (this.draggedSource.type === 'cascade' && this.draggedSource.index === target.index) {
                    return false;
                }
                const targetCascade = this.cascades[target.index];
                const toEmpty = targetCascade.length === 0;
                const maxMovable = this.getMaxMovableCards(toEmpty);
                return cardCount <= maxMovable && this.canMoveToCascade(topCard, target.index);
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
            if (source.type === 'freecell' && source.index === target.index) return false;
            if (source.type === 'cascade' && source.index === target.index) return false;
        }

        let success = false;

        // 이동 전 상태 저장 (undo용)
        const prevState = this.saveState();

        // 대상별 이동 로직
        switch (target.type) {
            case 'freecell':
                if (cards.length === 1) {
                    success = this.moveToFreeCell(source, target.index);
                }
                break;
            case 'foundation':
                if (cards.length === 1) {
                    success = this.moveToFoundation(source, target.suit);
                }
                break;
            case 'cascade':
                success = this.moveToCascade(source, target.index, cards);
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
     * 캐스케이드로 이동 (다중 카드 지원)
     */
    moveToCascade(source, targetIndex, cards) {
        if (!cards || cards.length === 0) return false;

        const topCard = cards[0];
        if (!this.canMoveToCascade(topCard, targetIndex)) return false;

        // 이동 가능 수 확인
        const targetCascade = this.cascades[targetIndex];
        const toEmpty = targetCascade.length === 0;
        const maxMovable = this.getMaxMovableCards(toEmpty);
        if (cards.length > maxMovable) return false;

        // 소스에서 카드들 제거
        if (source.type === 'cascade') {
            // 캐스케이드에서 여러 카드 제거
            this.cascades[source.index].splice(source.cardIndex, cards.length);
        } else {
            // 프리셀에서 단일 카드 제거
            this.removeCardFromSource(source);
        }

        // 타겟 캐스케이드에 카드들 추가
        this.cascades[targetIndex].push(...cards);
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
