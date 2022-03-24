// Avi Pesach Utilities JS File
//
//
//
//
'use strict'






function getTime() {
    return new Date().toString().split(' ')[4];
}


function getRandomColorHsl_inlineStyle() {

    var htmlInlineStyle = '';
    var randomHsl = getRandomInt(0, 360);
    var color1 = ` hsla(${randomHsl}, 50%, 65%, 0.99) `;
    var color2 = ` hsla(${randomHsl}, 55%, 70%, 0.7) `;
    htmlInlineStyle += ` background-color: ${color1}; ` + ` box-shadow: inset 10px 10px 0 ${color2}; `
        // console.log('color', htmlInlineStyle);
    return htmlInlineStyle
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function sumMatrixDiagonal(matrix, isAntiDiagonal) {
    var matrixOrder = matrix.length;
    var sum = 0;
    var antiSum = 0;
    if (isAntiDiagonal) {
        var j = matrixOrder - 1;
        var k = 0;
        while (j >= 0) {
            antiSum += matrix[j][k];
            // console.log('matrix[j][k]', matrix[j][k]);
            j--;
            k++;
        }
    }
    if (isSquareMatrix(matrix)) {
        for (var i = 0; i < matrixOrder; i++) {
            sum += matrix[i][i];
            // console.log('matrix[i][i]', matrix.length);


        }
    }
    // console.log('sum for diagonal: ' + isAntiDiagonal + '=  ', sum, antiSum);
    if (isAntiDiagonal) {
        return antiSum
    } else {
        return sum
    }
}


function isSquareMatrix(matrix) {
    var rowLengths = true;
    var colLengths = true;
    for (var row = 0; row < matrix.length - 1; row++) {
        if (matrix[row].length !== matrix[row + 1].length) {
            rowLengths = false;
        }
        // rowLengths = (matrix[row].length !== matrix[row + 1].length) ? false : continue;
    }
    colLengths = (matrix.length === matrix[0].length) ? true : false;

    if (rowLengths && colLengths) {
        // console.log('it is square matrix');
        return true
    } else return false
}


function itemsCounterToMap(matrix) {
    var itemsMap = {};

    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[0].length; j++) {
            var currItem = matrix[i][j]
            itemsMap[currItem] = !itemsMap[currItem] ? 1 : itemsMap[currItem] + 1
        }
    }

    return itemsMap
}


function sumMatrixCol(matrix, colIdx) {
    var sum = 0;

    for (var row = 0; row < matrix.length; row++) {

        for (var col = 0; col < matrix.length; col++) {
            if (col === colIdx) {

                sum += matrix[row][col];
            }
        }
    }
    console.log('sum Col ' + colIdx + '=', sum);
    return sum
}


function sumMatrixRow(matrix, rowIdx) {
    var sum = 0;
    for (var row = 0; row < matrix.length; row++) {
        var currRow = matrix[row];
        if (row === rowIdx) {
            for (var col = 0; col < currRow.length; col++) {
                var currCell = currRow[col];
                sum += currCell
            }
        }
    }
    // console.log('sum row ' + rowIdx + '=', sum);

    return sum
}


function sumAreaInMatrix(matrix, rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    var rowsRange = rowIdxEnd + 1 - rowIdxStart;
    var ColsRange = colIdxEnd + 1 - colIdxStart;
    var sum = 0;

    for (var row = 0; row < rowsRange; row++) {

        for (var col = 0; col < ColsRange; col++) {

            var currCell = matrix[rowIdxStart + row][colIdxStart + col];
            sum += currCell;
        }
    }
    // console.log('area sum= ' + sum);
    return sum
}


function bubble_Sort(numsArray) {
    var isSwapped;
    var n = numsArray.length - 1;
    do {
        isSwapped = false;
        for (var i = 0; i < n; i++) {
            if (numsArray[i] < numsArray[i + 1]) { //then do the swap swap
                var temp = numsArray[i];
                numsArray[i] = numsArray[i + 1];
                numsArray[i + 1] = temp;
                isSwapped = true;
            }
        }
        n--;
    } while (isSwapped);
    return numsArray;
}


function bubbleSort(a) {
    var swapped = true;
    while (swapped) {
        swapped = false;
        for (var i = 0; i < a.length - 1; i++) {
            if (a[i] > a[i + 1]) {
                var temp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = temp;
                swapped = true;
            }
        }
    }
}


function getNthLargest(numsArray, nthNum) {
    var sortedArray = bubble_Sort(numsArray);
    // console.log('original array:', nums);
    // console.log('sorted:', sortedArray);
    var nthLargest = sortedArray[nthNum - 1]
        // console.log('nthNum:', nthNum, '\n nthLargest:', nthLargest);
    return nthLargest
}


function sortNums(numsArray) {
    for (var i = 0; i < numsArray.length; i++) {

        for (var j = 0; j < numsArray.length; j++) {
            console.log('iam here')
            console.log('i+j', i, j)
            if (numsArray[j] > numsArray[j + 1]) {
                var temp = numsArray[j]
                numsArray[j] = numsArray[j + 1]
                numsArray[j + 1] = temp
            }
        }
    }
    return numsArray
}


function removeDuplicates(numsArray) {
    var newArray = [];

    for (var i = 0; i < numsArray.length; i++) {

        var currNum = numsArray[i];
        // console.log('currNum', currNum, 'Exist already?', isItemExist(newArray, currNum))
        if (!newArray.includes(currNum)) {

            newArray.push(currNum)
        }
    }
    return newArray
}

function isArrayInMatrix(matrix, arrayToFind) {
    for (var idx = 0; idx < matrix.length; idx++) {
        // This if statement depends on the format of your array
        if (matrix[idx][0] == arrayToFind[0] && matrix[idx][1] == arrayToFind[1]) {
            return idx; // Found it
        }
    }
    return false; // Not found
}

function removeDuplicatesFromMatrix(matrix) {
    var map = new Map();
    matrix.forEach((item) => map.set(item.join(), item));
    console.log(Array.from(map.values()));
}


function sumArrays(arrayA, arrayB) {
    var resultant = [];
    var numA = null;
    var numB = null;
    var sum = 0;

    if (arrayA.length >= arrayB.length) {
        var longerArray = arrayA;
    } else {
        longerArray = arrayB;
    }

    for (var i = 0; i < longerArray.length; i++) {
        numA = arrayA[i];
        numB = arrayB[i];
        sum = numA === undefined || numB === undefined ? longerArray[i] : numA + numB
            // console.log('///////////// scalar1:', scalar1, ',scalar2:', scalar2, ',sum = ', sum);
        resultant.push(sum)
    }
    // console.log('///////////// resultant array: \n', resultant)
    return resultant
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min); //(range)=inclusive
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


function getFactorial(num) {
    var counter = 1;
    var res = 1;

    while (counter < num) {
        res *= counter;
        counter++
    }

    // console.log(
    //     'input: n=' + num + '\n' +
    //     'expected: ' + 'n! = 6' + '\n' +
    //     'actual: ' + res
    // )

    return res
}


function getBigger(num1, num2) {
    var bigger;

    if (num1 > num2) {
        bigger = num1;
    } else {
        bigger = num2
    }
    return bigger
}


function isEven(number) {

    if (number % 2 === 0) {
        return true
    } else {
        return false
    }
}



function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);
    // N(LOG N)
    return merge(mergeSort(left), mergeSort(right));
}

// This function merges 2 sorted arrays into a single sorted array
function merge(arr1, arr2) {
    var result = [];
    // while there are items in both arrays
    while (arr1.length && arr2.length) {
        // push the smaller
        if (arr1[0] <= arr2[0]) {
            result.push(arr1.shift());
        } else {
            result.push(arr2.shift());
        }
    }
    // Add the remaining items
    while (arr1.length) result.push(arr1.shift());
    while (arr2.length) result.push(arr2.shift());

    return result;
}


function numsComparator(num1, num2) {
    return num1 - num2;
    // should return:
    // POSITIVE if num1 > num2
    // NEGATIVE if num1 < num2
    // ZERO if num1 === num2
}


// items is a sorted array
function binarySearch(items, item) {
    // items is a sorted array
    // initial values for start, middle and end
    var leftIdx = 0
    var rightIdx = items.length - 1
    var middleIdx = Math.floor((leftIdx + rightIdx) / 2)
        // While the middle is not what we're looking for and the list does not have a single item
    while (leftIdx <= rightIdx) {
        if (items[middleIdx] === item) return middleIdx;

        if (item < items[middleIdx]) {
            rightIdx = middleIdx - 1
        } else {
            leftIdx = middleIdx + 1
        }

        // recalculate middle on every iteration
        middleIdx = Math.floor((leftIdx + rightIdx) / 2)
    }
    return -1
}
// items is a sorted array
function binarySearchRecursion(items, item, leftIdx = 0, rightIdx = items.length - 1) {
    // items is a sorted array
    if (leftIdx > rightIdx) {
        return -1;
    }
    var middleIdx = Math.floor((rightIdx + leftIdx) / 2);
    if (items[middleIdx] === item) {
        return middleIdx;
    } else if (items[middleIdx] > item) {
        return binarySearchRecursion(items, item, leftIdx, middleIdx - 1);
    } else {
        return binarySearchRecursion(items, item, middleIdx + 1, rightIdx);
    }
}


function getContainingCells(board, value) {
    // to add more found cells to an existing array,
    // implement as follows:
    // 
    // array_to_add_to.push(...getContainingCells(board_to_run_on, value_to_search))
    // 
    var foundCells = [];
    var coords = null;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j] === value) {
                coords = { i: i, j: j }
                foundCells.push(coords)
            }
        }
    }
    return foundCells;
}


function createSquaredBoard(matrixOrder) {
    var board = [];
    for (var i = 0; i < matrixOrder; i++) {
        board.push([]);
        for (var j = 0; j < matrixOrder; j++) {
            board[i][j] = '';
        }
    }
    return board;
}

function renderMatrixBoard(matrixBoard, classToRenderIn) {

    var tableStrHTML = ''

    for (var i = 0; i < matrixBoard.length; i++) {
        tableStrHTML += '<tr> \n'
        for (var j = 0; j < matrixBoard[0].length; j++) {
            var cellContent = matrixBoard[i][j]
            var cellClassName = (cellContent) ? 'that-pretty-class' : ''
            tableStrHTML += `\t <td data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i}, ${j})" class="${cellClassName}" >${cellContent}</td>\n`

        }
    }
    tableStrHTML += '</tr> \n'
    console.log('=====>', 'tableStrHTML', tableStrHTML);
    var elBoard = document.querySelector(classToRenderIn)
    elBoard.innerHTML = tableStrHTML
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    console.log('elCell:', elCell)
    elCell.innerText = value

    elCell.classList.remove('occupied')

}


function toggleGameBtn(elBtn) {
    if (gGameInterval) {
        clearInterval(gGameInterval)
        gGameInterval = null
        elBtn.innerText = 'Play'
    } else {
        gGameInterval = setInterval(play, GAME_FREQ);
        elBtn.innerText = 'Pause'
    }

}



function countNeighbors(cellI, cellJ, mat, countedValue) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;

            if (mat[i][j] === countedValue) neighborsCount++;
        }
    }
    return neighborsCount;
}