'use strict'

var gBoard = [];
var gMines = [];
var gElMines;
var gFlags = [];
var gSize = 10;
var gMinesAmount = 5; //! cant be bigger than gSize
var gLives
var gElTable = document.querySelector('table');
var gElTimer = document.querySelector('.timer');
var gElLives = document.querySelector('.lives')
var gTimeStart;
var gInterval;
const EMPTY = '';
const MINE = '*';








function init() {
    gBoard = createSquaredBoard(gSize);
    gMines = spreadMines(+gMinesAmount).sort();
    gLives = 3;
    getAllNumbers(gBoard);
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
    console.log('=====>', 'tableStrHTML', tableStrHTML);
    var elBoard = document.querySelector(classToRenderIn)
    elBoard.innerHTML = tableStrHTML
}

function cellClicked(elCell) {
    var cellI = +elCell.dataset.i;
    var cellJ = +elCell.dataset.j;
    if (elCell.classList.contains('flag')) return
    if (!gInterval) {
        timer();
    }
    checkGameOver(gBoard[cellI][cellJ]);

    switch (gBoard[cellI][cellJ]) {
        case MINE:

            mineClicked(elCell)

            //TODO: lose life
            break;
        case '':
            //TODO: recursive opening
            blankCellHandler(elCell)
            break;
        default:
            //TODO: put this in a function 
            openCell(elCell)
                // elCell.innerText = gBoard[cellI][cellJ];
                // elCell.classList.add('opened-cell');
            break;
    }
    checkGameOver()

}

function openCell(elCell) {
    elCell.innerText = gBoard[+elCell.dataset.i][+elCell.dataset.j];
    elCell.classList.add('opened-cell');
    elCell.dataset.isOpened = true;
}

function flagAdder(ev) {
    ev.preventDefault();
    var elCell = ev.srcElement
    console.log('=====>', 'ev', ev);
    if (!gInterval) timer();
    if (elCell.classList.contains('opened-cell')) return

    // console.log('=====>', 'elCell.dataset', elCell.dataset);
    var cellI = +elCell.dataset.i;
    var cellJ = +elCell.dataset.j;

    if (elCell.dataset.isFlagged === "false") {
        elCell.dataset.isFlagged = "true";
        gFlags.push([cellI, cellJ]);
    } else {
        if (elCell.innerText !== MINE) {
            elCell.dataset.isFlagged = "false";
            gFlags.splice(isArrayInMatrix(gFlags, [cellI, cellJ]))
        }
    }
    gFlags.sort();
    elCell.classList.toggle('flag');
    checkGameOver();
}

function blankCellHandler(elCell) {
    var blanks = [];
    openCell(elCell);
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) { // 9 cells to check
            var iToCheck = +elCell.dataset.i + i;
            var jToCheck = +elCell.dataset.j + j;
            var checkedCell = document.querySelector(`[data-i='${iToCheck}'][data-j='${jToCheck}']`);
            // console.log('=====>', 'checkedCell', checkedCell);
            if (!checkedCell || checkedCell.dataset.isOpened === 'true' || checkedCell.dataset.mine === 'true') continue
            else if (gBoard[iToCheck][jToCheck] > 0) {
                openCell(checkedCell);
                continue;
            } else if (gBoard[iToCheck][jToCheck] === EMPTY) {
                openCell(checkedCell);
                blanks.push(checkedCell);
            }

        }
    }
    // console.log('=====>', 'blanks', blanks);
    blanks.sort()
    for (var idx = 0; idx < blanks.length; idx++) {
        var currCell = blanks[idx];

        blankCellHandler(currCell);
        blanks.shift();
    };

}

function checkGameOver() {


    if (gLives === 0) {
        //DONE: check deaths
        gameLost()


    } else {
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
                        console.log('im in2');
                        isAllOpen = false;
                    }
                }
            };
            console.log('=====>', 'isAllOpen', isAllOpen);

            if (isAllFlagged && isAllOpen) gameWon();
        }
    }

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
    if (!stop && !gInterval) {
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
//TODO: BONUS if count adjacents = 0 ==> recursive open empties and search mines
//TODO:Show a timer that starts on first click (right / left) and stops when game is over.
//TODO:LOSE: when clicking a mine, all mines should be revealed
//TODO:WIN: all the mines are flagged, and all the other cells are shown
//TODO:Support 3 levels of the game --- Beginner (4*4 with 2 MINES), Medium (8 * 8 with 12 MINES), Expert (12 * 12 with 30 MINES)
//TODO:make your Minesweeper look great
//TODO:
//TODO: