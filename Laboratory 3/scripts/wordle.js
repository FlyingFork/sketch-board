const WORDS = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];

function resetBoard() {
    const board = document.getElementById('board');
    const rows = board.querySelectorAll('.row');

    rows.forEach((row, r) => {
        const cells = row.querySelectorAll('.cell');
        cells.forEach((cell, c) => {
            cell.textContent = '';
            cell.classList.remove('green', 'yellow', 'red');
        });
    });
}

window.onload = function () {
    let board = document.getElementById('board');
    let guessButton = this.document.getElementById('guessButton');
    let guessInput = this.document.getElementById('guessInput');

    if (guessInput) {
        guessInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                if (guessButton) guessButton.click();
            }
        });
    }

    for (let i = 0; i < 6; i++) {
        let row = this.document.createElement('div');
        row.classList.add('row');
        board.append(row);

        for (let j = 0; j < 5; j++) {
            let cell = this.document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-column', j);
            row.append(cell);
        }
    }

    const randomNumber = Math.round(Math.random() * (WORDS.length));
    let word = WORDS[randomNumber] && WORDS[randomNumber] || 'media';
    let tries = 0;

    console.log("[Game Start] Word is: " + word);

    guessButton.addEventListener('click', function () {
        let guess = guessInput.value;

        if (guess.length < 5 || guess.length > 5) {
            alert("Word must be of 5 characters");
            return;
        }

        for (let i = 0; i < 5; i++) 
        {
            let currentCell = document.querySelector(
                `[data-row="${tries}"][data-column="${i}"]`
            );
            let currentLetter = document.createTextNode(guess[i]);
            currentCell.append(currentLetter);

            if (guess[i] == word[i]) 
            {
                //green cell, letter on right position
                currentCell.classList.add('green');
            }
            else
            {
                if (word.indexOf(guess[i]) < 0)
                {
                    //red cell, letter not found
                    currentCell.classList.add('red');
                }
                else
                {
                    //yellow cell
                    currentCell.classList.add('yellow');
                }
            }
        }
        if (word == guess)
        {
            alert("You won");
            // guessButton.setAttribute('disabled', 'disabled');
            resetBoard();
            tries = 0;
            let randomNumber2 = Math.round(Math.random() * (WORDS.length));
            word = WORDS[randomNumber2] && WORDS[randomNumber2] || 'media';

            console.log("[Won] Word is: " + word);
            return;
        };
        if (tries == 5)
        {
            alert("You lost! The word was: " + word);
            resetBoard();
            tries = 0;
            let randomNumber2 = Math.round(Math.random() * (WORDS.length));
            word = WORDS[randomNumber2] && WORDS[randomNumber2] || 'media';

            console.log("[Lost] Word is: " + word);
            return;
        }

        tries++;
    })
}