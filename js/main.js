'use strict'

var gBoard = [];
var gMines = [];
var gElMines;
var gFlags = [];
var gSize = 4;
var gMinesAmount = 2;
var gLives = 2;
var gElTable = document.querySelector('table');
var gElTimer = document.querySelector('.timer');
var gElLives = document.querySelector('.lives');
var gElMinesCounter = document.querySelector('.mines-counter')
var gTimeStart;
var gEndTime
var gInterval;
var gPeekMode = false;
const EMPTY = '';
const MINE = '*';








function init() {
    gBoard = createSquaredBoard(gSize);
    gMines = spreadMines(+gMinesAmount).sort();
    getAllNumbers(gBoard);
    gElLives.innerText = gLives;
    gElMinesCounter.innerText = gMinesAmount
    renderMineField(gBoard, '.mine-field');



    console.log('gBoard:');
    console.table(gBoard);
    console.log('gMines', gMines);
}










function spreadMines(amount) {
    var cellValue
    var mines = []
    for (var i = 0; i < amount;) {
        //DONE: change "4" to matrix order
        var row = getRandomInt(0, gSize);
        var col = getRandomInt(0, gSize);
        // DONE: stop overlapping mines from deploying

        cellValue = gBoard[row][col];
        if (cellValue === MINE) continue; //repeat if occupied
        gBoard[+row][+col] = MINE;
        mines.push([+row, +col]);
        i++;
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
            tableStrHTML += `\t <td data-i="${i}" data-j="${j}" ${data} data-is-flagged="false" data-is-opened="false" onclick="cellClicked(this, ${i}, ${j})" class="${cellClassName}"  oncontextmenu="flagAdder(event)"></td>\n`
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
    if (gInterval === 0) {
        timer();
    }
    if (elCell.classList.contains('opened-cell') || elCell.classList.contains('flag')) return
    checkGameOver(gBoard[cellI][cellJ]);

    if (gPeekMode) {
        gPeekMode = false;
        hintPeek(elCell);
        return
    }


    switch (gBoard[cellI][cellJ]) {
        case MINE:

            mineClicked(elCell)

            //TODO: lose life
            break;
        case '':
            //TODO: recursive opening
            recursiveOpener(elCell)
            break;
        default: //a cell with a number
            //TODO: put this in a function 
            openCell(elCell)
            break;
    }
    checkGameOver()

}

function openCell(elCell) {
    elCell.innerText = gBoard[+elCell.dataset.i][+elCell.dataset.j];
    elCell.classList.add('opened-cell');
    elCell.dataset.isOpened = "true";
}

function flagAdder(ev, fromRecursiveOpen = false) {
    if (!fromRecursiveOpen) ev.preventDefault();
    var elCell = (fromRecursiveOpen) ? ev : ev.srcElement
    if (gInterval === 0) timer();

    // console.log('=====>', 'elCell.dataset', elCell.dataset);
    var cellI = +elCell.dataset.i;
    var cellJ = +elCell.dataset.j;
    if ((elCell.dataset.isFlagged === "true" || fromRecursiveOpen)) {
        //for a flagged cell:
        if (elCell.innerText !== MINE) { //is already flagged or bombed cell:
            elCell.dataset.isFlagged = "false";
            gFlags.splice(isArrayInMatrix(gFlags, [cellI, cellJ]))
        }

    } else /* (elCell.dataset.isFlagged === "false") */ {
        if (elCell.classList.contains('opened-cell')) return //?? interrupting flags?
        if (gFlags.length >= gMines.length) return
        elCell.dataset.isFlagged = "true";
        gFlags.push([cellI, cellJ]);
    }


    gFlags.sort();
    elCell.classList.toggle('flag');
    gElMinesCounter.innerText = (elCell.classList.contains('flag')) ? --gElMinesCounter.innerText : ++gElMinesCounter.innerText


    checkGameOver();
}

function recursiveOpener(elCell, fromRecursiveOpen = false) {
    if (!fromRecursiveOpen) openCell(elCell);
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) { // 9 cells to check
            var iToCheck = +elCell.dataset.i + i;
            var jToCheck = +elCell.dataset.j + j;
            var checkedCell = document.querySelector(`[data-i='${iToCheck}'][data-j='${jToCheck}']`);
            if (!checkedCell || checkedCell.dataset.isOpened === 'true' || checkedCell.dataset.mine === 'true') continue
                //left with only numbers and empties to check:
            if (elCell.dataset.isFlagged === 'true') {
                flagAdder(checkedCell, true)
            }

            if (gBoard[iToCheck][jToCheck] > 0) {
                openCell(checkedCell);
            } else if (gBoard[iToCheck][jToCheck] === EMPTY) {
                openCell(checkedCell);
                recursiveOpener(checkedCell, true);
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
    timer(stop);
    console.log('*******Game Lost*******');

}

function gameWon() {
    //TODO modal, reset gParameters
    timer(stop);
    console.log('*******Game Won!*******');
}

function mineClicked(elCell) {
    openCell(elCell)
    elCell.dataset.isFlagged = "true";
    gFlags.push([+elCell.dataset.i, +elCell.dataset.j]);
    gFlags.sort();
    elCell.classList.toggle('flag');
    gElMinesCounter.innerText = --gElMinesCounter.innerText
    checkGameOver();

    elCell.style.backgroundColor = 'red';
    gLives--;
    gElLives.innerText = gLives;


    if (!gElMines) {
        gElMines = document.querySelectorAll('.mine-cell')
            // console.log('=====>', 'gElMines', gElMines);
    }



    //opens all mines:
    if (gLives === 0) {

        for (var i = 0; i < gElMines.length; i++) {
            gElMines[i].style.backgroundColor = 'red'
            gElMines[i].innerText = MINE

        }
    }
}

function timer(stop) {
    if (checkGameOver() === true) return
    if (!stop && gInterval === 0) {
        gTimeStart = new Date;
        gInterval = setInterval(timer, 100);
    }

    var currentTime = new Date - gTimeStart
    currentTime = (currentTime / 1000).toFixed(2) + 's'
    gElTimer.innerText = currentTime;

    if (stop) {
        var endTime = currentTime;
        clearInterval(gInterval);
        gElTimer.innerText = endTime;
        gEndTime = currentTime - gTimeStart;
    }
}


function chooseDifficulty(boardSize, MinesAmount) {
    gLives = (MinesAmount === 2) ? 2 : 3
    gSize = boardSize
    gMinesAmount = MinesAmount
    init()
}


//TODO: 
function hintPeek() {
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) { // 9 cells to check
            var iToCheck = +elCell.dataset.i + i;
            var jToCheck = +elCell.dataset.j + j;
        }
    }
}



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
//TODO:peek - hint
//TODO:safe cell - hint
//TODO:score/high-score
//TODO:smiley rest button
//TODO: manual deploy mode
//TODO: 7 boom mode
//TODO:design lives
//TODO:header
//TODO:footer
//TODO: lose red indicator on mines not open
//TODO:make your Minesweeper look great
//TODO: