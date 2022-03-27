'use strict'

var gBoard = [];
var gMines = [];
var gElMines;
var gFlags = [];
var gSize = 8;
var gMinesAmount = 12;
var gLives = 2;
var gHints = 3;
var gElTable = document.querySelector('table');
var gElTimer = document.querySelector('.timer');
var gElLives = document.querySelector('.lives');
var gElHints = document.querySelector('.hints-counter');
var gElManualBtn = document.querySelector('.manual');
var gElMinesCounter = document.querySelector('.mines-counter');
var gElScore = document.querySelector('.score');
var gElPeekBtn;
var gInterval = 0;
var gTimeStart;
var gTimerBlocked = false;
var gEndTime;
var gScore = 0;
var gHighScore = 10;
var gPeekMode = false;
var gManualSpread = false;
var gIs7Boom = false;
const EMPTY = '';
const MINE = '💣';
const MINE_BCG = '#DD4A48'
const OPEN_BCG = '#7f8390cb'








function init() {
    gBoard = createSquaredBoard(gSize);
    gMines = getMode()
    getAllNumbers(gBoard);
    gInterval = 0;
    gFlags = [];
    gPeekMode = false;
    gLives = (gSize === 4) ? 2 : 3;
    gElLives.innerText = gLives;
    gHints = 3;
    gElHints.innerText = gHints;
    gElMinesCounter.innerText = gMinesAmount;
    gElTimer.innerText = '0.00s';
    gTimerBlocked = false;
    gScore = 0;
    gElScore.innerText = 'SCORE: 0';

    renderMineField(gBoard, '.mine-field');
    document.querySelector('.smiley').style.backgroundImage = "url('img/Smiley_main.png')";
    document.querySelector('.smiley').innerText = '';

    console.log('gBoard:');
    console.table(gBoard);
    console.log('gMines', gMines);
}










function autoSpreadMines(amount) {
    var cellValue
    var mines = []
    gElManualBtn.style.backgroundColor = (gManualSpread) ? 'yellow' : 'gray';


    for (var i = 0; i < amount; i++) {
        var row = getRandomInt(0, gSize);
        var col = getRandomInt(0, gSize);

        cellValue = gBoard[row][col];
        if (cellValue === MINE) continue; //repeat if occupied
        gBoard[+row][+col] = MINE;
        mines.push([+row, +col]);

    }
    return mines
}


function getAllNumbers(board) {
    var number = 0;

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j] === MINE) continue; //dont count for mines

            number = countAdjacentMines(+i, +j);
            // if (number === 0) continue  //? do i want it EMPTY here or on rendering
            gBoard[i][j] = number;
        }
    }

}


function countAdjacentMines(cellI, cellJ) {
    var adjacentsCount = 0;

    // if (gBoard[cellI][cellJ] === MINE) return MINE    //duplicated at getAllNumbers()

    for (var i = cellI - 1; i <= cellI + 1; i++) { //run on rows
        if (i < 0 || i >= gBoard.length) continue; //because row is out of bounds

        for (var j = +cellJ - 1; j <= +cellJ + 1; j++) { //run on row's cells
            if (i === +cellI && j === +cellJ) continue; //because center cell itself is not a neighbor
            if (j < 0 || j >= gBoard[i].length) continue; //because cell is out of bounds

            if (gBoard[i][j] === MINE) adjacentsCount++;
        }
    }
    var res = (adjacentsCount > 0) ? +adjacentsCount : '';

    return res;
}


function renderMineField(matrixBoard, classToRenderIn) {

    var tableStrHTML = ''

    for (var i = 0; i < matrixBoard.length; i++) {
        tableStrHTML += '<tr> \n'
        for (var j = 0; j < matrixBoard[0].length; j++) {
            var cellContent = matrixBoard[i][j]
            var cellClassName = (cellContent === MINE) ? 'mine-cell' : ''
            var data = (cellContent === MINE) ? " data-mine= 'true' " : " data-mine= 'false' "
            tableStrHTML += `\t <td data-i="${i}" data-j="${j}" ${data} data-is-flagged="false" data-is-opened="false" onclick="cellClicked(this, ${i}, ${j})" class="${cellClassName}"  oncontextmenu="flagToggle(event)"></td>\n`
                // tableStrHTML += `\t <td data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i}, ${j})" class="${cellClassName}" >${cellContent}</td>\n`

        }
    }
    tableStrHTML += '</tr> \n'
        // console.log('=====>', 'tableStrHTML: \n', tableStrHTML);
    var elBoard = document.querySelector(classToRenderIn)
    elBoard.innerHTML = tableStrHTML
}


function cellClicked(elCell) {


    var cellI = +elCell.dataset.i;
    var cellJ = +elCell.dataset.j;
    timeHandler();
    // if (elCell.classList.contains('opened-cell') || elCell.classList.contains('flag')) return
    if (elCell.dataset.isFlagged === 'true' || elCell.dataset.isOpened === 'true') return
    checkGameOver(gBoard[cellI][cellJ]);

    if (gPeekMode) {
        gHints--;
        gElHints.innerText = gHints;
        var allTds = gElTable.querySelectorAll('td');
        allTds.forEach(td => {
            if (gPeekMode) {
                td.style.cursor = 'help'
            } else td.style.cursor = 'pointer'
        })

        hintPeekRender(elCell);
        return
    }


    switch (gBoard[cellI][cellJ]) {
        case MINE:

            mineClicked(elCell)

            //Done: lose life
            break;
        case '':
            //Done: recursive opening
            recursiveOpener(elCell)
            break;
        default: //a cell with a number
            //Done: put this in a function 
            openCell(elCell)
            break;
    }
    checkGameOver()

}


function openCell(elCell) {
    elCell.innerText = gBoard[+elCell.dataset.i][+elCell.dataset.j];
    elCell.classList.add('opened-cell');
    elCell.style.backgroundColor = '#7f8390cb';
    elCell.dataset.isOpened = "true";
}


function flagToggle(ev) {
    ev.preventDefault();
    var elCell = ev.srcElement
    timeHandler();
    if (gPeekMode) return

    // console.log('=====>', 'elCell.dataset', elCell.dataset);
    var cellI = +elCell.dataset.i;
    var cellJ = +elCell.dataset.j;
    if ((elCell.dataset.isFlagged === "true")) {
        //for a flagged cell:
        if (elCell.innerText !== MINE) { //is already flagged or bombed cell:
            elCell.dataset.isFlagged = "false";
            gFlags.splice(isArrayInMatrix(gFlags, [cellI, cellJ]))
        }

    } else /* (elCell.dataset.isFlagged === "false") */ {
        // if (elCell.classList.contains('opened-cell')) return //?? interrupting flags?
        if (elCell.dataset.isOpened === 'true') return //?? interrupting flags?
        if (gFlags.length >= gMines.length) return
        elCell.dataset.isFlagged = "true";
        gFlags.push([cellI, cellJ]);
    }


    gFlags.sort();
    if (elCell.dataset.isOpened === 'false') elCell.classList.toggle('flag');
    // gElMinesCounter.innerText = (elCell.classList.contains('flag')) ? --gElMinesCounter.innerText : ++gElMinesCounter.innerText
    gElMinesCounter.innerText = (elCell.dataset.isFlagged = 'true') ? --gElMinesCounter.innerText : ++gElMinesCounter.innerText


    checkGameOver();
}


function recursiveOpener(elCell) {
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) { // 9 cells to check
            var iToCheck = +elCell.dataset.i + i;
            var jToCheck = +elCell.dataset.j + j;
            var checkedCell = document.querySelector(`[data-i='${iToCheck}'][data-j='${jToCheck}']`);
            if (!checkedCell || checkedCell.dataset.isOpened === 'true' || checkedCell.dataset.mine === 'true' || elCell.dataset.isFlagged === 'true') continue
                //left with only numbers and empties to check:
            if (gBoard[iToCheck][jToCheck] > 0) {
                openCell(checkedCell);
            } else if (gBoard[iToCheck][jToCheck] === EMPTY) {
                openCell(checkedCell);
                recursiveOpener(checkedCell);
            }

        }
    }

}


function checkGameOver() {
    var isGameOver = false;


    if (gLives === 0) { //check if lost all life
        isGameOver = true;
        gameLost();
    } else { //check for the win if all flags mark all mines && all other cells are open
        if (gMines.length === gFlags.length) {
            var isAllFlagged = true;
            for (var i = 0; i < gMines.length; i++) {
                for (var j = 0; j < gMines[i].length; j++) {

                    if (gMines[i][j] !== gFlags[i][j]) {
                        isAllFlagged = false;
                    }
                }
                // console.log('=====>', 'isAllFlagged', isAllFlagged);
            }

            //TODO add a "and all other cells are open"
            var elCells = gElTable.querySelectorAll('td');
            // console.log('=====>', 'elCells', elCells);
            var isAllOpen = true;

            for (var idx = 0; idx < elCells.length; idx++) {
                var elCell = elCells[idx];
                if (elCell.dataset.isOpened === 'false') {
                    if (elCell.dataset.mine === 'false') {
                        isAllOpen = false;
                    }
                }
            };
            // console.log('=====>', 'isAllOpen', isAllOpen);

            if (isAllFlagged && isAllOpen) {
                isGameOver = true;
                gameWon();
            }

        }
    }
    return isGameOver
}


function gameLost() {
    //TODO modal, reset gParameters
    timeHandler('stop');
    gTimerBlocked = true;
    console.log('*******Game Lost*******');
    calculateHighScore();
    document.querySelector('.smiley').style.backgroundImage = "url('img/Smiley_lose.png')"
    document.querySelector('.smiley').innerText = 'Loser...'


}


function gameWon() {
    //TODO modal, reset gParameters
    timeHandler('stop');
    gTimerBlocked = true;
    console.log('*******Game Won!*******');
    calculateHighScore();
    document.querySelector('.smiley').style.backgroundImage = "url('img/Smiley_win.png')"
    document.querySelector('.smiley').innerText = 'VICTORY!!!'
}


function mineClicked(elCell) {
    openCell(elCell)
    elCell.dataset.isFlagged = "true";
    gFlags.push([+elCell.dataset.i, +elCell.dataset.j]);
    gFlags.sort();
    // elCell.classList.toggle('flag');
    gElMinesCounter.innerText = --gElMinesCounter.innerText
    checkGameOver();

    elCell.style.backgroundColor = MINE_BCG;
    gLives--;
    gElLives.innerText = gLives;


    if (!gElMines) {
        gElMines = document.querySelectorAll('.mine-cell')
            // console.log('=====>', 'gElMines', gElMines);
    }



    //opens all mines:
    if (gLives === 0) {

        for (var i = 0; i < gElMines.length; i++) {
            gElMines[i].style.backgroundColor = MINE_BCG
            gElMines[i].innerText = MINE

        }
    }
}


function timeHandler(request) {
    if (gTimerBlocked) return
    if (gInterval === 0) { // only when new game
        // if (checkGameOver() === true) return
        gTimeStart = new Date;
        gInterval = setInterval(timeHandler, 100);
    }

    var currentTime = new Date - gTimeStart
    var currentTimeToDisplay = (currentTime / 1000).toFixed(2) + 's'
    gElTimer.innerText = currentTimeToDisplay;

    if (request === 'stop') {
        var endTimeToDisplay = currentTimeToDisplay;
        clearInterval(gInterval);
        gElTimer.innerText = endTimeToDisplay;
        gEndTime = currentTime
    }
}


function chooseDifficulty(boardSize, MinesAmount) {
    gLives = (MinesAmount === 2) ? 2 : 3;
    gSize = boardSize;
    gMinesAmount = MinesAmount;
    timeHandler('stop');
    gManualSpread = false;
    init();
}


function calculateHighScore() {
    // (max time points)*(inverse time)*(unblown mines)*(lives left) + (consolation prize)

    gScore = 1000000 * (1 / gEndTime) * (gMinesAmount - gElMinesCounter.innerText) * gLives - 1 * (3 - gHints) * 100;
    gScore = Math.floor(gScore);

    if (gScore > gHighScore) {
        gHighScore = gScore;
        document.querySelector('.high-score').innerText = `HIGH SCORE: ${gHighScore}`
        console.log('*******NEW HIGH SCORE*******');
    }

    renderScore()
}


function hintPeek(btn) {
    if (gHints <= 0) return
    gElPeekBtn = btn
    gPeekMode = !gPeekMode;
    if (gPeekMode) {
        btn.style.backgroundColor = '#bcac52';
    } else btn.style = 'initial';

    var allTds = gElTable.querySelectorAll('td');
    allTds.forEach(td => {
        if (gPeekMode) {
            td.style.cursor = 'help'
        } else td.style.cursor = 'pointer'

    });


}


function hintPeekRender(elCell) {
    var peekedCells = [];
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) { // 9 cells to check
            var iToPeek = (+elCell.dataset.i) + i;
            var jToPeek = (+elCell.dataset.j) + j;
            var elPeekedCell = gElTable.querySelector(`[data-i='${iToPeek}'][data-j='${jToPeek}']`);
            if (!elPeekedCell) continue;
            if (elPeekedCell.dataset.isOpened === 'true') continue;
            if (gBoard[iToPeek][jToPeek]) elPeekedCell.innerText = gBoard[iToPeek][jToPeek];
            elPeekedCell.style.backgroundColor = '#ccd36850';
            elPeekedCell.style.cursor = 'pointer';
            peekedCells.push(elPeekedCell);
        }
    }
    gPeekMode = false;
    gElPeekBtn.style = 'unset'
    hidePeek(peekedCells);

    var allTds = gElTable.querySelectorAll('td');
    allTds.forEach(td => {
        td.style.cursor = 'pointer'
    });

}


function hidePeek(array) {
    setTimeout(() => {

        for (var idx = 0; idx < array.length; idx++) {
            var peekedCell = array[idx];
            var i = +peekedCell.dataset.i;
            var j = +peekedCell.dataset.j;

            if (gBoard[i][j]) peekedCell.innerText = '';
            peekedCell.style.backgroundColor = 'unset';
        }

    }, 1000);
}


function hintSafeCell() {
    if (gHints <= 0) return

    //picks a random cell in gBoard and check it is not a mine:
    var hintedCellRow = getRandomInt(0, gBoard.length);
    var hintedCellCol = getRandomInt(0, gBoard[hintedCellRow].length);
    var hintedCell = [hintedCellRow, hintedCellCol];
    while (isArrayInMatrix(gMines, hintedCell)) {
        hintedCellRow = getRandomInt(0, gBoard.length);
        hintedCellCol = getRandomInt(0, gBoard[hintedCellRow].length);
        hintedCell = [hintedCellRow, hintedCellCol];
    }
    //find and flash the cell:
    var elRow = gElTable.querySelectorAll(`[data-i="${hintedCellRow}"]`);
    var elCell;

    for (var col = 0; col < elRow.length; col++) {
        var currCell = elRow[col];
        if (+currCell.dataset.j === hintedCellCol) {
            elCell = currCell;
            break
        }
    }
    if (elCell.dataset.isOpened === 'true') hintSafeCell();
    elCell.classList.add('hinted-safe')
    setTimeout(() => {
        elCell.style.transition = '0.8s';
        elCell.classList.remove('hinted-safe')

    }, 3500)
    setTimeout(() => {
        elCell.style.transition = '0.3s';
    }, 5000)

    gHints--;
    gElHints.innerText = gHints;
}

function renderScore() {
    var elScore = document.querySelector('.score');
    elScore.innerText = `SCORE: ${gScore}`;
    console.log('=====>', 'elScore', elScore);
}

function getMode() {
    var mines = [];

    if (gIs7Boom) mines = make7BoomMines().sort;
    else if (gManualSpread) mines = manualSpreadMines(+gMinesAmount).sort();
    else mines = autoSpreadMines(+gMinesAmount).sort();

    return mines
}

function go7Boom() {
    alert('Lets go 7-Boom!')
    gIs7Boom = true;
    init();
}

function make7BoomMines() {
    var mines = [];
    var cellId = 0;


    for (var i = 0; i < gSize; i++) {
        for (var j = 0; j < gSize; j++) {
            cellId++
            var cell = gBoard[i][j];
            if (cellId % 7 === 0 || cellId.toString().indexOf(7) !== (-1)) {
                gBoard[i][j] = MINE;
                mines.push([i, j])
            }

        }
    }

    gIs7Boom = false;
    return mines
}


//TODO LIST:


//TODO: fix manual mode

// function goManual(btn) {
//     gManualSpread = !gManualSpread;
//     alert('manual spread');
//     if (gManualSpread) manualSpreadMines();
//     init();

// }

// function manualSpreadMines() {

//     gElManualBtn.style.backgroundColor = (gManualSpread) ? 'yellow' : 'gray';
//     var mines = [];
//     var cellValue;

//     for (var i = 0; i < gMinesAmount; i++) {
//         var cellRow = +prompt(`Please enter your desired ${i} mine row: \n -Type \'stop\' to randomize the rest.`);
//         if (cellRow === 'stop' || cellRow === '\'stop\'' || cellRow === Nan) break;
//         var cellCol = +prompt(`Please enter your desired ${i} mine column: \n -Type \'stop\' to randomize the rest.`);
//         if (cellCol === 'stop' || cellCol === '\'stop\'' || cellCol === Nan) break;
//         var userCell = [cellRow, cellCol];
//         if (typeof cellRow === 'number' || typeof cellCol === 'number') gMines.push(+userCell);
//     }

//     for (var i = 0; i < gMinesAmount - mines.length; i++) {
//         var row = getRandomInt(0, gSize);
//         var col = getRandomInt(0, gSize);

//         cellValue = gBoard[row][col];
//         if (cellValue === MINE) continue; //repeat if occupied
//         gBoard[+row][+col] = MINE;
//         mines.push([+row, +col]);

//     }


//     return mines
// }


//DONE: function make a board
//DONE: print board to console
//DONE: put mines inside
//DONE: if cell is not MINE => function to count neighboring mines
//DONE: if found  mines count>0 => print count to cell
//DONE: render board to html
//DONE: function to change classes in HTML
//DONE: function gets location and take care of what inside (if blown, if empty, if show number)
//DONE: BONUS if count adjacents = 0 ==> recursive open empties and search mines
//DONE:Show a timer that starts on first click (right / left) and stops when game is over.
//DONE:LOSE: when clicking a mine, all mines should be revealed
//DONE:WIN: all the mines are flagged, and all the other cells are shown
//DONE:fix timer bug run again after game
//DONE:Support 3 difficulties levels of the game --- Beginner (4*4 with 2 MINES), Medium (8 * 8 with 12 MINES), Expert (12 * 12 with 30 MINES)
//DONE:mines left indicator
//DONE:peek - hint
//DONE:safe cell - hint
//DONE:score/high-score
//TODO:smiley reset button
//TODO: manual deploy mode
//TODO: 7 boom mode
//TODO:design lives
//TODO:header
//TODO:footer
//TODO: lose red indicator on mines not open
//TODO:make your Minesweeper look great
//TODO: