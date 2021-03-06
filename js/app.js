/*-----GLOBAL VARIABLES-----*/

// Card Val Arrays
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];

// Buttons
const turnOneBtn = document.getElementById('turnOne');
const turnThreeBtn = document.getElementById('turnThree');
const undoBtn = document.getElementById('undo');
const newGameBtn = document.getElementById('newGame');
const timerBtn = document.getElementById('timerBtn');

// Message
const message = document.getElementById('message');

// Play Area
const playAreaEl = document.getElementById('playArea');
const masterDeckEl = document.getElementById('deck');
const discardPileEl = document.getElementById('discard');

// Play Stacks
const aceZoneOneEl = document.getElementById('aceZoneOne');
const aceZoneTwoEl = document.getElementById('aceZoneTwo');
const aceZoneThreeEl = document.getElementById('aceZoneThree');
const aceZoneFourEl = document.getElementById('aceZoneFour');
const playStackOneEl = document.getElementById('playStackOne');
const playStackTwoEl = document.getElementById('playStackTwo');
const playStackThreeEl = document.getElementById('playStackThree');
const playStackFourEl = document.getElementById('playStackFour');
const playStackFiveEl = document.getElementById('playStackFive');
const playStackSixEl = document.getElementById('playStackSix');
const playStackSevenEl = document.getElementById('playStackSeven');

// Play Stack Array
const playStackElArr = [
  discardPileEl,
  aceZoneOneEl,
  aceZoneTwoEl,
  aceZoneThreeEl,
  aceZoneFourEl,
  playStackOneEl,
  playStackTwoEl,
  playStackThreeEl,
  playStackFourEl,
  playStackFiveEl,
  playStackSixEl,
  playStackSevenEl
]

// Stats
const timerHrsEl = document.getElementById('timerHrs');
const timerMinsEl = document.getElementById('timerMins');
const timerSecsEl = document.getElementById('timerSecs');
const movesNumEl = document.getElementById('movesNum');
const stockNumEl = document.getElementById('stockNum');

// Move and stock count stats
let moveNum = 0;
let stockNum = 24;

// Timer Vars
let hours = 0;
let minutes = 0;
let seconds = 0;

// Turn Var
let turnNum = 1;

// Card Stacks array to store all played cards
let cardStacks = [
  discard = [],
  aceZoneOne = [],
  aceZoneTwo = [],
  aceZoneThree = [],
  aceZoneFour = [],
  playStackOne = [],
  playStackTwo = [],
  playStackThree = [],
  playStackFour = [],
  playStackFive = [],
  playStackSix = [],
  playStackSeven = []
]

/*-----DECK VARIABLES-----*/

// Create a 'discard' deck to store card objects when turned from shuffledDeck 
const discardDeck = [];

// Build a 'master' deck of 'card' objects used to create shuffled decks
const masterDeck = buildMasterDeck();
renderDeckInContainer(masterDeck, masterDeckEl);

// Shuffled deck state variable
let shuffledDeck;

// Cached element references
const shuffledContainer = document.getElementById('deck');
const discardContainer = document.getElementById('discard');

/*-----GLOBAL EVENT LISTENERS-----*/

// Button click listeners
const turnOneClick = turnOneBtn.addEventListener('click', turnOne);
const turnThreeClick = turnThreeBtn.addEventListener('click', turnThree);
const undoClick = undoBtn.addEventListener('click', undo);
const newGameClick = newGameBtn.addEventListener('click', init);
const timerClick = timerBtn.addEventListener('click', timerStartStop);

// Play area click listeners
const playAreaClick = playAreaEl.addEventListener('click', cardClick);

/*-----DECK FUNCTIONS-----*/

function getNewShuffledDeck() {
  // Create a copy of the masterDeck (leave masterDeck untouched!)
  const tempDeck = [...masterDeck];
  const newShuffledDeck = [];
  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length);
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
  }
  return newShuffledDeck;
}

function renderNewShuffledDeck() {
  // Create a copy of the masterDeck (leave masterDeck untouched!)
  shuffledDeck = getNewShuffledDeck();
  renderDeckInContainer(shuffledDeck, shuffledContainer);
}

function renderDeckInContainer(deck, container) {
  container.innerHTML = '';
  // Let's build the cards as a string of HTML
  let cardsHtml = '';
  deck.forEach(function(card) {
    cardsHtml += `<div class="card ${card.face} back-red" data-location="deck"></div>`;
  });
  container.innerHTML = cardsHtml;
}

function buildMasterDeck() {
  const deck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function(suit) {
    ranks.forEach(function(rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting color for the card
        color: `${suit}` === 'c' ? 'b' : `${suit}` === 's' ? 'b' : `${suit}` === 'h' ? 'r' : 'r',
        // Setting the suit of the card
        suit: `${suit}`,
        // Setting the 'value' property for game of solitaire
        value: Number(rank) || (rank === 'A' ? 1 : (rank === 'J' ? 11 : (rank === 'Q' ? 12 : 13))),
        // Setting which side of the card is displayed
        side: 'down'
      });
    });
  });
  return deck;
}

renderNewShuffledDeck();

/*-----GAME FUNCTIONS-----*/

function init() {
  renderNewShuffledDeck();
  dealDeck();
  timerReset();
  timerStartStop();
}

function dealDeck() {
  clearCardStacks();
  // Set the stackIdx to 4 so we don't deal to the ace zones
  let stackIdx = 5;
  // Store the startingIdx. This will ++ when reaching the last playStack.
  let startingIdx = 5;
  // Loop through shuffledDeck and deal to the stacks.
  shuffledDeck.forEach(card => {
    // Declare the slice var
    let slice = shuffledDeck.slice(shuffledDeck.indexOf(card), shuffledDeck.indexOf(card) + 1)
    // Only deal the first 28 cards
    if (shuffledDeck.indexOf(card) <= 27 && stackIdx < 12) {
      if (stackIdx < 11) {
        cardStacks[stackIdx].unshift(slice);
        stackIdx++;
      }
      else if (stackIdx === 11) {
        cardStacks[stackIdx].unshift(slice);
        startingIdx++;
        // Start next loop at subsequent stack
        stackIdx = startingIdx;
      }
    } else {return;}
  })
  //Remove the 28 cards that were dealt from the deck
  shuffledDeck.splice(0, 28);
  // Remove the 28 first children of MasterDeckEl
  for (i = 0; i < 28; i++) {
    masterDeckEl.firstChild.remove();
  }
  updateStockCount();
  renderDeal();
}

// Clear card stacks before dealing cards
function clearCardStacks() {
  cardStacks.forEach(stack => {
    let stackIdx = cardStacks.indexOf(stack);
    let playStackEl = playStackElArr[stackIdx];
    playStackEl.innerHTML = '';
  })
  cardStacks.forEach(stack => {
    stack.splice(0, stack.length);
  })
}

// Render the initial deal
function renderDeal() {
  playStackElArr.forEach(El => {
    El.innerHTML = '';
  })
  cardStacks.forEach(stack => {
    let stackIdx = cardStacks.indexOf(stack);
    let playStackEl = playStackElArr[stackIdx];
    stack.forEach(cards => {
      let cardsHtml = '';
      cards.forEach(card => {
        let newCardDiv = document.createElement('div');
        newCardDiv.classList.add('card', 'cardInStack', 'xlarge');
        // Set top 20px below previous card
        newCardDiv.setAttribute('style', `top: ${stack.indexOf(cards) * 20}px`)
        // Set data-location to playStacks
        newCardDiv.setAttribute('data-location', 'playStacks');
        // Set data-value
        newCardDiv.setAttribute('data-value', `${card.value}`);
        // Set data-color
        newCardDiv.setAttribute('data-color', `${card.color}`);
        // Set data-suit
        newCardDiv.setAttribute('data-suit', `${card.suit}`);
        // Set data-face
        newCardDiv.setAttribute('data-face', `${card.face}`);
        // Set data-side
        newCardDiv.setAttribute('data-side', `${card.side}`);
        if (stack.indexOf(cards) === stack.length - 1) {
          card.side = 'up';
          newCardDiv.setAttribute('data-side', 'up');
        };
        if (newCardDiv.dataset.side === 'down') {
          newCardDiv.classList.add('back-red');
        } else {
          newCardDiv.classList.add(`${card.face}`);
        }
        playStackEl.append(newCardDiv);
      })
    })
  })
}

// Render the cards in the playStacks
function renderPlayStacks() {
  playStackElArr.forEach(El => {
    El.innerHTML = '';
  })
  cardStacks.forEach(stack => {
    let stackIdx = cardStacks.indexOf(stack);
    let playStackEl = playStackElArr[stackIdx];
    stack.forEach(cards => {
      let cardsHtml = '';
      cards.forEach(card => {
        let newCardDiv = document.createElement('div');
        newCardDiv.classList.add('card', 'cardInStack', 'xlarge');
        if (card.side === 'up') {
          newCardDiv.classList.add(`${card.face}`);
        } else if (card.side === 'down') {
          newCardDiv.classList.add('back-red');
        }
        // Only apply style to playStacks, not discard or ace zones
        if (stackIdx >= 5) {
          // Set top 20px below previous card
          newCardDiv.setAttribute('style', `top: ${stack.indexOf(cards) * 20}px`)
          // Set data-location to playStacks
          newCardDiv.setAttribute('data-location', 'playStacks');
          // Set data-value
          newCardDiv.setAttribute('data-value', `${card.value}`);
          // Set data-color
          newCardDiv.setAttribute('data-color', `${card.color}`);
          // Set data-suit
          newCardDiv.setAttribute('data-suit', `${card.suit}`);
          // Set data-face
          newCardDiv.setAttribute('data-face', `${card.face}`)
          // Set data-side
          newCardDiv.setAttribute('data-side', `${card.side}`)
        }
        else if (stackIdx <= 4 && stackIdx > 0) {
          // Set top 0px
          newCardDiv.setAttribute('style', 'top: 0px')
          // Set data-location to playStacks
          newCardDiv.setAttribute('data-location', 'aceZones');
          // Set data-value
          newCardDiv.setAttribute('data-value', `${card.value}`);
          // Set data-color
          newCardDiv.setAttribute('data-color', `${card.color}`);
          // Set data-suit
          newCardDiv.setAttribute('data-suit', `${card.suit}`);
          // Set data-face
          newCardDiv.setAttribute('data-face', `${card.face}`)
          // Set data-side
          newCardDiv.setAttribute('data-side', `${card.side}`)
        }
        else if (stackIdx === 0) {
          card.side = 'up';
          // Set top 0px
          newCardDiv.setAttribute('style', 'top: 0px')
          // Set data-location to playStacks
          newCardDiv.setAttribute('data-location', 'discard');
          // Set data-value
          newCardDiv.setAttribute('data-value', `${card.value}`);
          // Set data-color
          newCardDiv.setAttribute('data-color', `${card.color}`);
          // Set data-suit
          newCardDiv.setAttribute('data-suit', `${card.suit}`);
          // Set data-face
          newCardDiv.setAttribute('data-face', `${card.face}`)
          // Set data-side
          newCardDiv.setAttribute('data-side', `${card.side}`)
          newCardDiv.classList.add(`${card.face}`)
        }
        stack[stack.length - 1][0].side = 'up';
        playStackEl.append(newCardDiv);
      })
    })
  })
}

/*-----FORCE WINNER FOR PRESENTATION-----*/

const easterEgg = document.querySelector('.brand > img');

const easterEggClick = easterEgg.addEventListener('click', forceWinner);

function forceWinner() {
  console.log('easter egg was clicked')
    cardStacks[1].push([{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}], [{face: 'sK', color: 'b', suit: 's', value: 13, side: 'up'}]);
    cardStacks[2].push([{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}], [{face: 'hK', color: 'r', suit: 'h', value: 13, side: 'up'}]);
    cardStacks[3].push([{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}], [{face: 'dK', color: 'r', suit: 'd', value: 13, side: 'up'}]);
    cardStacks[4].push([{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}], [{face: 'cK', color: 'b', suit: 'c', value: 13, side: 'up'}]);
    renderPlayStacks();
    playStackOneEl.innerHTML = '';
    playStackTwoEl.innerHTML = '';
    playStackThreeEl.innerHTML = '';
    playStackFourEl.innerHTML = '';
    playStackFiveEl.innerHTML = '';
    playStackSixEl.innerHTML = '';
    playStackSevenEl.innerHTML = '';
    checkWinner();
  }

// Button Functions

function turnOne() {
  console.log('The TURN ONE button was clicked');
  turnNum = 1;
  turnOneBtn.classList.add('activeTurnBtn');
  turnThreeBtn.classList.remove('activeTurnBtn');
}

function turnThree() {
  console.log('The TURN THREE button was clicked');
  turnNum = 3;
  turnThreeBtn.classList.add('activeTurnBtn');
  turnOneBtn.classList.remove('activeTurnBtn');
}

function undo() {
  console.log('The UNDO button was clicked');
} 

function timerStartStop() {
  if (timerBtn.dataset.status === 'inactive') {
    timerStart();
  } else if (timerBtn.dataset.status === 'active') {
    timerStop();
  }
}

function timerStart() {
  timerBtn.dataset.status = 'active';
  timerBtn.classList.remove('start');
  timerBtn.classList.add('stop');
  timeElapsed = setTimeout(function() {
    seconds++;
    if (seconds > 59) {
      seconds = 0;
      minutes++;
      if (minutes > 59) {
        minutes = 0;
        hours++;
        if (hours < 10) {
          timerHrsEl.innerText = `0${hours}`
        } else {
          timerHrsEl.innerText = `${hours}`
        };
      };
    };
    if (minutes < 10) {
      timerMinsEl.innerText = `0${minutes}`;
    } else {
      timerMinsEl.innerText = `${minutes}`;
    }
    if (seconds < 10) {
      timerSecsEl.innerText = `0${seconds}`;
    } else {
      timerSecsEl.innerText = `${seconds}`;
    }
    timerStart();
  }, 1000);
}

function timerStop() {
  timerBtn.dataset.status = 'inactive';
  timerBtn.classList.remove('stop');
  timerBtn.classList.add('start');
  clearTimeout(timeElapsed);
}

function timerReset() {
  hours = 0;
  minutes = 0;
  seconds = 0;
}

// Card Click Function
function cardClick(e) {
  if (e.target.id !== 'playArea') {
    switch (true) {
      case (e.target.dataset.location === 'deck'):
        deckClick();
        break;
      case (e.target.dataset.location === 'discard' || e.target.dataset.location === 'playStacks'):
        playStacksClick(e);
        break;
      case (e.target.dataset.location === 'aceZones'):
        aceZoneClick();
        break;
      case (e.target.dataset.location === 'playStacks'):
        playStacksClick(e);
        break;
    }
  updateStockCount();
  } else {return;}
}

// Deck click function
function deckClick() {
  if (shuffledDeck.length > 1) {
    shuffledDeck[shuffledDeck.length - 1].side = 'up';
    cardStacks[0].push([shuffledDeck.pop()]);
    console.log(masterDeckEl.lastChild)
    masterDeckEl.lastChild.remove();
    updateMoveCount();
  } else if (shuffledDeck.length === 1) {
    shuffledDeck[shuffledDeck.length - 1].side = 'up';
    cardStacks[0].push([shuffledDeck.pop()]);
    console.log(masterDeckEl.lastChild)
    masterDeckEl.lastChild.remove();
    updateMoveCount();
  } else if (shuffledDeck.length === 0) {
    console.log('replenish the deck')
    updateMoveCount();
    replenishDeck();
  }
  console.log(shuffledDeck.length)
  renderPlayStacks();
}

// Replenish deck function
function replenishDeck() {
  masterDeckEl.innerHTML = discardPileEl.innerHTML;
  masterDeckEl.childNodes.forEach(node => {
    node.dataset.location = 'deck';
  })
  cardStacks[0].forEach(card => {
    card[0].side = 'down';
    shuffledDeck.unshift(card[0]);
  })
  cardStacks[0].splice(0);
  discardPileEl.innerHTML = '';
  // shuffledDeck.push(cardStacks[0].splice(0));
}

function aceZoneClick() {
  console.log('One of the ace zones was clicked');
}

function playStacksClick(e) {
  let color = e.target.dataset.color;
  let value = e.target.dataset.value;
  let suit = e.target.dataset.suit;
  let parentId = e.target.parentElement.id;
  let stackIdx = [
  'discard',
  'aceZoneOne',
  'aceZoneTwo',
  'aceZoneThree',
  'aceZoneFour',
  'playStackOne',
  'playStackTwo',
  'playStackThree',
  'playStackFour',
  'playStackFive',
  'playStackSix',
  'playStackSeven'
  ]
  // If the card clicked is the last in the stack
  if (!e.target.nextSibling) {lastCardClick(e)}
  // If the card clicked is NOT the last in the stack
  else if (e.target.nextSibling) {innerCardClick(e)}
  function lastCardClick(e) {
    // First check if it can go to any of the aceZones
    if (suit === 's' && cardStacks[1].length === value - 1) {
      e.target.setAttribute('style', 'top: 0px;');
      aceZoneOneEl.append(e.target);
      cardStacks[1].push(cardStacks[`${stackIdx.indexOf(parentId)}`].pop());
    } else if (suit === 'h' && cardStacks[2].length === value - 1) {
      e.target.setAttribute('style', 'top: 0px;');
      aceZoneTwoEl.append(e.target);
      cardStacks[2].push(cardStacks[`${stackIdx.indexOf(parentId)}`].pop());
    } else if (suit === 'd' && cardStacks[3].length === value - 1) {
      e.target.setAttribute('style', 'top: 0px;');
      aceZoneThreeEl.append(e.target);
      cardStacks[3].push(cardStacks[`${stackIdx.indexOf(parentId)}`].pop());
    } else if (suit === 'c' && cardStacks[4].length === value - 1) {
      e.target.setAttribute('style', 'top: 0px;');
      aceZoneFourEl.append(e.target);
      cardStacks[4].push(cardStacks[`${stackIdx.indexOf(parentId)}`].pop());
    } else {
        // Check if it can go to any of the playStacks
        for (i = 0; i < cardStacks.length; i++) {
          if (cardStacks[i].length > 0 && cardStacks[i].at(-1)[0].value === Number(value) + 1 && cardStacks[i].at(-1)[0].color !== color) {
            cardStacks[i].push(cardStacks[`${stackIdx.indexOf(parentId)}`].pop());
            break;
          } else if (cardStacks.indexOf(cardStacks[i]) >= 5 && cardStacks[i].length === 0 && Number(value) === 13) {
            cardStacks[i].push(cardStacks[`${stackIdx.indexOf(parentId)}`].pop());
            break;
          }
        }
      }
    updateMoveCount();
    renderPlayStacks();
    checkWinner();
  }
  function innerCardClick(e) {
    console.log('an inner card was clicked');
    let parentNodeArr;
    let splicedArr;
    // Check if it can go to any of the playStacks. THIS NEEDS TO BE CHANGED to FOR LOOP, NOT FOREACH LOOP.
    cardStacks.forEach(stack => {
      if (stack.length > 0 && stack.at(-1)[0].value === Number(value) + 1 && stack.at(-1)[0].color !== color) {
        parentNodeArr = Array.from(e.target.parentNode.childNodes);
        splicedArr = cardStacks[`${stackIdx.indexOf(parentId)}`].splice(parentNodeArr.indexOf(e.target));
        for (i = 0; i < splicedArr.length; i++) {
          stack.push(splicedArr[i]);
        }
        return;
      } else if (cardStacks.indexOf(stack) >= 5 && stack.length === 0 && Number(value) === 13) {
        console.log('a king was clicked')
        parentNodeArr = Array.from(e.target.parentNode.childNodes);
        splicedArr = cardStacks[`${stackIdx.indexOf(parentId)}`].splice(parentNodeArr.indexOf(e.target));
        for (i = 0; i < splicedArr.length; i++) {
          stack.push(splicedArr[i]);
        }
      }
    })
    updateMoveCount();
    renderPlayStacks();
    checkWinner();
  }
}

function updateStockCount() {
  stockNumEl.innerText = `${shuffledDeck.length + cardStacks[0].length}`;
}

function updateMoveCount() {
  moveNum++
  movesNumEl.innerText = moveNum;
}

function checkWinner() {
  if (cardStacks[1].length === 13 && cardStacks[2].length === 13 && cardStacks[3].length === 13 && cardStacks[4].length === 13) {
    message.innerText = 'You won!';
  }
}

init();