var ChessEngine = require('chessengine')

function GameHandler(game, gameMessages) {
    this.chessgame = new ChessEngine();
    this.board = this.chessgame.startNewStandardGame();
    this.players = [{}, {}];
    var self = this;

    gameMessages.on('connection', (socket) => {
        //handle player assignment
        if (game.playersConnected < 2) {
            if (game.playersConnected === 0) {
                socket.emit('init', { player: 0 });

                self.players[0] = { id: socket.id, socket: socket, num: 0 };
                game.playersConnected++;
            } else if (game.playersConnected === 1) {
                socket.emit('init', { player: 1 });
                socket.emit('bothconnected');

                self.players[1] = { id: socket.id, socket: socket, num: 1 };
                game.playersConnected++;
            }
        } else {
            socket.emit('gamefull');
        }

        socket.on('moveattempt', function (movePos) {
            var isPlayersTurn = socket.id === self.players[self.board.turn].id;
            var bothPlayersConnected = game.playersConnected === 2

            if (isPlayersTurn && bothPlayersConnected) {
                var moveAttempt = self.board.conductMoveFromPos(movePos.start, movePos.dest);

                if (moveAttempt) {
                    gameMessages.emit('boardupdate', movePos)
                }
            }
        });
    });
}

module.exports = GameHandler;