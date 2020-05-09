/* eslint-disable no-undef, no-unused-vars, no-loop-func */
var pieces = [];
var board;
let chess;
let selectedTile = null;
let data;
let pawn;

var PAGE_WIDTH;
var PAGE_HEIGHT;

var BreakException = {};

var tileSize;
var sound_move, sound_taken;

function preload() {
  data = loadJSON("../pieces.json");
  PAGE_WIDTH = window.innerWidth;
  PAGE_HEIGHT = window.innerHeight;
  tileSize = 40;

  sound_move = loadSound("../rec/sound/chess_move.wav");
  sound_taken = loadSound("../rec/sound/myMove.mp3");
}

function setup() {
  noStroke();
  fill(0, 0, 0);
  createCanvas(PAGE_WIDTH, PAGE_HEIGHT);
  frameRate(30);
  createBoard(START_POSITION);

  //kingCheck();
}

function draw() {
  server();
}

const mouseOn = (x, y, w, h) =>
  mouseX >= x + 1 &&
  mouseX <= x - 1 + w &&
  mouseY >= y + 1 &&
  mouseY <= y - 1 + h;

function isHover(x1, x2, y1, y2) {
  if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
    console.log("true!");
    return true;
  }
  return false;
}

const swapColor = c => (c === "White" ? "Black" : "White");

//PIECES
var WHITE = "w";
var BLACK = "b";

var EMPTY = -1;

var PAWN = "p";
var KNIGHT = "n";
var BISHOP = "b";
var ROOK = "r";
var QUEEN = "q";
var KING = "k";


var START_POSITION =
   "##########################qQ##K####b############################";

// var START_POSITION =
//   "rnbqkbnrpppppppp################################PPPPPPPPRNBQKBNR";
//going N = -8
//going S = +8
//going W = -1
//going E = +1
//going NW = -9
//going NE = -7
//going SW = +7
//going SE = +9

var PAWN_OFFSET = {
  w: [-16, -32, -17, -15],
  b: [16, 32, 17, 15]
};
var KNIGHT_OFFSET = [18,14,33,31,-18,-14,-33,-31];
var BISHOP_OFFSET = [-17, -15, 17, 15];
var ROOK_OFFSET = [-16, 1, 16, -1];
var KING_OFFSET = [-17, -16, -15, 1, 17, 16, 15, -1];
var QUEEN_OFFSET = [-17, -16, -15, 1, 17, 16, 15, -1];

var SQUARES = [
   0,   1,   2,   3,   4,   5,   6,   7,
  16,  17,  18,  19,  20,  21,  22,  23,
  32,  33,  34,  35,  36,  37,  38,  39,
  48,  49,  50,  51,  52,  53,  54,  55,
  64,  65,  66,  67,  68,  69,  70,  71,
  80,  81,  82,  83,  84,  85,  86,  87,
  96,  97,  98,  99, 100, 101, 102, 103,
 112, 113, 114, 115, 116, 117, 118, 119
];

let pieceArray = [];

const pieceInfo = {
  r: {
    name: "Rook",
    code: "r",
    directions: ROOK_OFFSET
  },
  p: {
    name: "Pawn",
    code: "p",
    directions: PAWN_OFFSET
  },
  n: {
    name: "Knight",
    code: "n",
    directions: KNIGHT_OFFSET
  },
  b: {
    name: "Bishop",
    code: "b",
    directions: BISHOP_OFFSET
  },
  q: {
    name: "Queen",
    code: "q",
    directions: QUEEN_OFFSET
  },
  k: {
    name: "King",
    code: "k",
    directions: KING_OFFSET
  }
};

function server() {
  //Emulatae the function of the server
  //drawBoard();
  //createBoard(START_POSITION);
  client(WHITE);
  //client(BLACK);
}

function createBoard(positions) {
  [...positions].forEach((letter, index) => {
      pieceArray.push(letter !== "#" ? new Piece(pieceInfo[letter.toLowerCase()], letter, index) : {});
  });
}

let boardString = START_POSITION;
let selectedPiece = null;
let highlightedPiece = null;
let pieceIsDragged = false;
let newBoardString = null;
let possibleMoves = null;

function client(team) {
  //const offset = team === WHITE ? 0 : 1;
  drawBoard();
  drawPieces(boardString);
  if(selectedPiece || highlightedPiece){
    drawOverlays();
    dragPiece();
  }
}

function sortArray() {
  let newPieceArray = [64];
  [...boardString].forEach((letter, index) => {

  })
  
}

function updateClients(newBoard) {
  //console.log(boardString, newBoardString);
  let toIndex;
  let fromIndex;
  for(var i=0; i < boardString.length; i++) {
    //console.log("check", boardString.charAt(i), "and", newBoardString.charAt(i));
    if (boardString.charAt(i) !== newBoardString.charAt(i)) {
      if (newBoardString.charAt(i) !== '#'){
        toIndex = i;
      } else {
        fromIndex = i;
      }
    }
  }
  pieceArray[toIndex] = pieceArray[fromIndex];
  pieceArray[fromIndex] = {}; 
  pieceArray[toIndex].hasMoved = true;
  pieceArray[toIndex].updatePosition(toIndex);
  boardString = newBoard;
  //pieceArray.forEach((piece, index) => piece.letter && !piece.dead ? piece.updatePosition(index) : null);
}

function drawBoard() {
  for (var x = 1; x <= 8; x++) {
    for (var y = 1; y <= 8; y++) {
      fill((x + y) % 2 === 1 ? color(181, 136, 99) : color(240, 217, 181));
      rect(tileSize * (x - 1),tileSize * (y - 1),tileSize,tileSize);
      rect(tileSize * (x - 1),tileSize * (y - 1) + (tileSize * 9),tileSize,tileSize);
    }
  }
}

function drawPieces(positions) {
  pieceArray.forEach((piece) => piece.letter && !piece.dead ? piece.render() : null);
}

function dragPiece() {
  if(mouseIsPressed){
  selectedPiece ? pieceIsDragged = true : pieceIsDragged = false;
  imageMode(CENTER);
  if(selectedPiece){image(selectedPiece.image, mouseX, mouseY, tileSize, tileSize);}
  //image(selectedPiece.image, (PAGE_WIDTH - mouseX) - (PAGE_WIDTH - (tileSize*8)), (PAGE_HEIGHT - mouseY) - tileSize + (PAGE_HEIGHT/200), tileSize, tileSize);
  imageMode(CORNER);
  } else{
    pieceIsDragged = false;
  }
}

class Piece {
  constructor(info, letter, index) {
    this.name = info.name;
    this.index = null;
    this.letter = letter;
    this.cord = null;
    this.cordFlip = null;
    this.team = getTeam(letter);
    this.image = loadImage(`../rec/images/${data.pieces[this.team.long][this.name]}`);
    this.selected = false;
    this.id = getTeam(letter).short+letter;
    this.dead = false;
    this.hasMoved = false;
    this.directions = letter.toLowerCase() === "p" ? pieceInfo[letter.toLowerCase()].directions[this.team.short] : pieceInfo[letter.toLowerCase()].directions;
    this.updatePosition(index);
  }

  updatePosition(index) {
    //console.log("new index", index);
    this.index = index;
    this.cord = getTilePos(index);
    this.cordFlip = createVector(((Math.abs((index % 8)-7))*tileSize), ((Math.abs((Math.floor(index/8)-7))*tileSize)) + (tileSize * 9));
  }

  hover() {
    if(mouseOn(this.cord.x, this.cord.y, tileSize, tileSize) && !pieceIsDragged) {
      fill(255, 128, 0);
      rect(this.cord.x, this.cord.y, tileSize, tileSize);
      rect(this.cordFlip.x, this.cordFlip.y, tileSize, tileSize);
      if(!selectedPiece){highlightedPiece = this;handleMovement(this);}
    } else {if(highlightedPiece === this && selectedPiece !== this){highlightedPiece = null;possibleMoves = null;}}
  }

  overlay() {
    if(selectedPiece?.index === this.index){
      fill(64,64,64,64);
      rect(this.cord.x, this.cord.y, tileSize, tileSize);
      rect(this.cordFlip.x, this.cordFlip.y, tileSize, tileSize);
    }
  }

  render() {
    this.hover();
    this.overlay();
    if(selectedPiece?.index === this.index && mouseIsPressed){tint(255,127);}
    image(this.image,this.cord.x,this.cord.y, tileSize, tileSize);
    image(this.image,this.cordFlip.x,this.cordFlip.y, tileSize, tileSize);
    tint(255,255);  
  }

  getPossibleMoves() {
    const offset = this.name === "Pawn" ? pieceInfo[this.letter.toLowerCase()].directions[this.team.short] :
      pieceInfo[this.letter.toLowerCase()].directions;
    const iterations = this.name === "Knight" || this.name === "King" || this.name === "Pawn" ? 1 : 8;
    const check = this.name === "Pawn" ? "Pawn" : "Normal";
    const moves = getMovementTiles(offset, iterations, this, check)["move"];
    return moves;
  }
}

function getMovementTiles(offset, iterations, piece, check=null) {
  let moves = {move: [], dir: []};
  let checkSecondSpace = true;
  for(var i=0; i< offset.length; i++){
    for(var k=1; k<iterations+1; k++){
      const targetTile = canMove(offset[i]*k, piece.index);
      if(targetTile === null){continue;}
      const targetTilePiece = pieceArray[targetTile];
      if(!check){moves.move.push(targetTilePiece);continue;}
      else if(check === "Normal"){
        if(targetTilePiece?.team && targetTilePiece?.team?.short !== piece.team.short){moves.move.push(targetTile);break;}
        if(targetTilePiece?.team?.short === piece.team.short){break;}
      }
      else if(check === "Pawn"){
        if(i === 0 && targetTilePiece.team){checkSecondSpace = false; continue;}
        if(i === 1 && (!checkSecondSpace || piece.hasMoved || targetTilePiece?.team)){continue;}
        if(i >= 2 && (targetTilePiece?.team?.short === piece.team.short || !targetTilePiece?.team)){continue;}
      }
      else if(check === "King"){
        moves.move.push(targetTile);moves.dir.push(i);continue;
      }
      moves.move.push(targetTile);
    }
  }
  return moves;
}

function handleCheck(piece) {
  let allowedMoves = null;
  const king = getPieceClassFromLetter('k')[0];
  if(piece.letter.toLowerCase() !== "k") {
    const checkData = kingCheck(piece, king);
    if(checkData.wouldBeCheck === true){
      allowedMoves = getMovementTiles([checkData.direction], 8, king, "King")["move"];
      allowedMoves.push(checkData.tilePutInCheck);
    }
  } else{return;}
  if(allowedMoves[0] === undefined){allowedMoves = null;}
  return allowedMoves;
}

function kingCheck(piece, king) {
  const offset = pieceInfo['q'].directions;
  const moveData = getMovementTiles(offset, 8, king, "King");
  //const moveIndexes = moveData["move"];
  const moves = {move:moveData["move"].map(move => pieceArray[move]), dir: moveData["dir"]};

  var direction;
  var wouldBeCheck;
  var checkTile;
  var diagonal = ["q","b"]
  var row = ["r","q"]

  for(var i=0; i < moves.move.length; i++) {
    if(moves.move[i] === piece){direction = moves.dir[i];}
    const pieces = moves.dir[i] % 2 === 0 || moves.dir[i] === 0 ? diagonal : row;
    if(pieces.includes(moves.move[i].letter)){wouldBeCheck = true;checkTile = moves.move[i];break;}
  }

  return {
    direction: king.directions[direction],
    wouldBeCheck: wouldBeCheck,
    checkTile: checkTile
  };
}

// function willBeCheck(piece) {
//   // const savedBoard = pieceArray;
//   // const savedPiece = savedBoard[piece.index];
//   // let tempBoard = pieceArray;
//   //tempBoard[piece.index].letter = '#';
//   const isCheck = kingCheck();
//   //tempBoard[piece.index].letter = piece.letter;
//   return isCheck;
// }

function canMove(offset, currIndex) {
  const moveSpace = SQUARES[currIndex] + offset;
  for (var i = 0; i <= SQUARES.length; i++) { if(moveSpace === SQUARES[i]) { return i; } }
  return null;
}

function mouseReleased() {
  const tile = getIndex(createVector(mouseX, mouseY));
  const tilePos = getTilePos(tile);
  if((!pieceIsDragged && !selectedPiece) || !possibleMoves.some(move => move[0].x === tilePos.x && move[0].y === tilePos.y)){return;}
  handleServerChange(tile, selectedPiece.index);
  selectedPiece = null;
  pieceIsDragged = false;
  //selectedPiece.updatePosition(tile);
}

function handleServerChange(fromIndex, toIndex) {
  if(newBoardString){boardString = newBoardString}
  newBoardString = boardString;
  newBoardString = replaceString(newBoardString, fromIndex, newBoardString[toIndex]);
  newBoardString = replaceString(newBoardString, toIndex, '#');
  updateClients(newBoardString);
}

function mousePressed() {
  if(mouseOn(1,1,width, height)) {
    const index = getIndex(createVector(mouseX, mouseY));
    const letter = getPieceInBoardString(index);
    const tilePos = getTilePos(index);
    let piece;
    if(letter !== "#") {
      piece = getPieceClassFromLetter(letter, index)[0];
      if(selectedPiece && selectedPiece.team.short !== piece.team.short) {
        selectedPiece = null
        return;
      }
      selectedPiece = piece
      handleMovement();
    } else {
      if(!possibleMoves.some(move => move[0].x === tilePos.x && move[0].y === tilePos.y)){selectedPiece = null;}
    }
  }
}

function handleMovement(piece=selectedPiece) {
  if(possibleMoves === null){
    let allowedMoves = handleCheck(piece);
    const moveIndexes = piece.getPossibleMoves();
    console.log(allowedMoves, moveIndexes);
    if(allowedMoves){
      console.log("yes");
      possibleMoves = moveIndexes.filter(move => allowedMoves.includes(move));
      possibleMoves = possibleMoves.map(index => [getTilePos(index), index])
    } else{
      possibleMoves = moveIndexes.map(index => [getTilePos(index), index])
    }
    allowedMoves = null;
  //console.log("movement check", check);
  //possibleMoves = kingCheck(possibleMoves, piece);
  }
}

function drawOverlays() {
  if(possibleMoves.length !== null) {
    fill(255, 155, 80, 170);
    possibleMoves.forEach(move => {
      if(getPieceInBoardString(move[1]) !== "#"){fill(40,200,40, 80);}
      if(mouseOn(move[0].x, move[0].y, tileSize, tileSize)){fill(40,100,40, 150);}
      rect(move[0].x+2.5, move[0].y+2.5, tileSize-5, tileSize-5)
      fill(255, 155, 80, 170);
    });
  }
}

///////// THE UNTOUCHABLES \\\\\\\\\ FUNCTION GRAVEYARD ///////// STAY THE FUCK OUT ZONE \\\\\\\\\
const getTilePos = index => createVector(((index % 8) * tileSize), ((Math.floor(index/8) * tileSize)));
const getIndex = pos => ((Math.floor(pos.y/tileSize))*8) + (Math.floor(pos.x/tileSize))
const getPieceInBoardString = index => boardString.charAt(index);
const getPieceClassFromLetter = (letter, index=null) => pieceArray.filter(piece => piece?.letter?.toLowerCase() === letter || (piece.letter === letter && piece.index === index));
const getTeam = letter => (letter.charCodeAt(0) < 97 ? {long:"White",short:WHITE} : {long:"Black",short:BLACK});
const replaceString = (string, index, replacement) => string.substr(0, index) + replacement+ string.substr(index + replacement.length);
//const getPiecesFromLetter = letter => pieceArray.filter(piece )