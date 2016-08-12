var Chess = require('chessengine');

var path = window.location.pathname;
var socket = io(path.substr(0, path.length - 1));

var two;
var game;
var highlight;
var player;


var curRenderedPieces = [];

var PLAYER = { WHITE: 0, BLACK: 1 };
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var l = HEIGHT / 8;


var chessCharacterMap = {
    'p': ['♙', '♟'],
    'b': ['♗', '♝'],
    'k': ['♘', '♞'],
    'K': ['♔', '♚'],
    'Q': ['♕', '♛'],
    'r': ['♖', '♜']
}

requestAnimationFrame(animate);

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
}

function squareClicked(square, socket) {
    var board = square.board;

    if (board.firstSelection === null && square.piece) {
        if (square.piece.player === player) {
            board.firstSelection = square;
            board.secondSelection = null;

            renderGame(square);
        }
    } else if (board.secondSelection === null) {
        board.secondSelection = square;

        if (board.isMoveValid(board.firstSelection, board.secondSelection)) {
            var moveValid = board.isMoveValid(board.firstSelection, board.secondSelection);
            var first = board.firstSelection;
            var second = board.secondSelection;

            board.firstSelection = null;
            board.secondSelection = null;

            var movePos = { start: first.pos, dest: second.pos, player: player };
            if (moveValid) socket.emit('moveattempt', movePos);
        } else {
            board.firstSelection = null;
            board.secondSelection = null;

            removeHighlight();
            renderGame();
        }
    }
}

function drawSquare(square) {
    var x = square.pos[0] * l + l / 2 + (WIDTH - HEIGHT) / 2;
    var y = square.pos[1] * l + l / 2;

    if (player === PLAYER.BLACK) y = HEIGHT - y;

    square.renderPos = { x: x, y: y };
    var squareRender = two.makeRectangle(x, y, l, l);

    var isDark = Math.abs((square.pos[0] % 2) - (square.pos[1] % 2));

    squareRender.fill = isDark ? 'white' : '#AAAAAA';

    two.update();

    squareRender._renderer.elem.addEventListener('click', function () {
        squareClicked(square, socket);
    }, false);

    square.squareRender = squareRender;
    return squareRender;
}

function drawPieces() {
    game.board.squares.forEach(function (square) {
        if (square.piece) {
            var x = square.renderPos.x;
            var y = square.renderPos.y;

            var character = chessCharacterMap[square.piece.character][square.piece.player];

            square.textRender = two.makeText(character, x, y);
            square.textRender.size = l * .6

            curRenderedPieces.push(square.textRender);
        }
    });
}

function animPiece(movePos, done) {
    var square = game.board.getSquare(movePos.start);
    var destSquare = game.board.getSquare(movePos.dest);

    var coords = square.textRender.translation;
    var movePiece = new TWEEN.Tween(coords)
        .to(destSquare.renderPos, 500)
        .easing(new Tween.Easing.Quartic)
        .start()
        .onComplete(done);

    var hideHighlight = new TWEEN.Tween(highlight.opacity)
        .to(0, 250)
        .start()
        .onComplete(function () {
            two.remove(highlight);
        });
}

function removeHighlight() {
    if (highlight) {
        two.remove(highlight);
        highlight = null;
    }
}

function drawHighlight(square) {
    removeHighlight()
    if (square == square.board.firstSelection) {
        var x = square.renderPos.x;
        var y = square.renderPos.y;

        highlight = two.makeRectangle(x, y, l, l);
        highlight.opacity = .5;
        highlight.fill = 'black';
    }
}

function renderGame(square) {
    document.title = game.board.turn ? "black turn" : "white turn";
    two.remove(curRenderedPieces);
    if (square) drawHighlight(square);
    drawPieces();

    two.update();
}

window.onload = function () {
    two = new Two({
        fullscreen: true
    }).appendTo(window.document.body);

    game = new Chess();
    game.startNewStandardGame();

    two.play();

    socket.on('init', (data) => {
        player = data.player;

        game.board.squares.forEach(drawSquare);
        renderGame();
    });

    socket.on('boardupdate', (movePos) => {
        if (movePos) {
            game.board.conductMoveFromPos(movePos.start, movePos.dest)
            animPiece(movePos, renderGame.bind(renderGame, game.board.getSquare(movePos.start)));
        }
    })

    socket.on('gamefull', () => {
        alert('sorry, game is full. start a new one maybe?')
    })

    socket.on('bothconnected', () => {
        alert('both players have connected. you may begin')
    })
}

