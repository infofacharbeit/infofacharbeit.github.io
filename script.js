var previous = "home"
var previous_link = "link1"

function show(shown, link) {
    if (shown == previous) {
        return false;
    } else {
        document.getElementById(shown).style.display = "block";
        document.getElementById(link).classList.add("active");
        document.getElementById(previous).style.display = "none";
        document.getElementById(previous_link).classList.remove("active");
        previous = shown
        previous_link = link
        return false;
    }
}

// OBJEKTERKENNUNG
// Basiert auf folgenden Tutorial
// https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection/#0

const cam_section = document.getElementById("cam_section");
const startpage_section = document.getElementById("startpage");

var object_model = undefined;


function load_cocoSsd_model() {
    document.getElementById("still_loading").classList.remove("removed");
    console.log("test")
    cocoSsd.load().then(function (loadedModel) {
        object_model = loadedModel;
        cam_section.classList.remove("invisible");
        startpage_section.classList.remove("invisible");
        document.getElementById("still_loading").classList.add("removed");
        document.getElementById("load_model_button").classList.add("removed");
    });

}



const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");

function hasGetUserMedia() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

var children = [];

if (hasGetUserMedia()) {
    const enable_webcam_button = document.getElementById("webcam_button");
    enable_webcam_button.addEventListener("click", enable_cam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}
function enable_cam(event) {
    if (!object_model) {
        //console.log("Model not loaded")
        return;
    }

    event.target.classList.add("removed");

    const constraints = {
        video: {
            facingMode: {
                exact: "environment"
            },
            width: {
                min: 1280,
                ideal: 1920,
                max: 2560,
            },
            height: {
                min: 720,
                ideal: 1080,
                max: 1440
            }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict_webcam);
    });
}

var english_words = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'];
var german_words = ['Person', 'Fahrrad', 'Auto', 'Motorrad', 'Flugzeug', 'Bus', 'Zug', 'LKW', 'Boot', 'Ampel', 'Feuerhydrant', 'Stoppschild', 'Parkuhr', 'Bank', 'Vogel', 'Katze', 'Hund', 'Pferd', 'Schaf', 'Kuh', 'Elefant', 'tragen', 'Zebra', 'Giraffe', 'Rucksack', 'Regenschirm', 'Handtasche', 'binden', 'Koffer', 'Frisbeescheibe', 'Skier', 'Snowboard', 'Sportball', 'Drachen', 'Baseballschläger', 'Baseballhandschuh', 'Skateboard', 'Surfbrett', 'Tennisschläger', 'Flasche', 'Weinglas', 'Tasse', 'Gabel', 'Messer', 'Löffel', 'Schüssel', 'Banane', 'Apfel', 'Sandwich', 'orange', 'Brokkoli', 'Karotte', 'Hotdog', 'Pizza', 'Krapfen', 'Kuchen', 'Stuhl', 'Couch', 'Topfpflanze', 'Bett', 'Esstisch', 'Toilette', 'Fernseher', 'Laptop', 'Maus', 'Fernbedienung', 'Tastatur', 'Handy', 'Mikrowelle', 'Ofen', 'Toaster', 'Waschbecken', 'Kühlschrank', 'Buch', 'Uhr', 'Vase', 'Schere', 'Teddybär', 'Fön', 'Zahnbürste'];


function translate(input) {
    if (english_words.includes(input)) {
        var translated_word = german_words[english_words.indexOf(input)];
        //console.log(translated_word);
        return translated_word;
    } else {
        //console.log(input);
        return input;
    }
}



function predict_webcam() {

    object_model.detect(video).then(function (predictions) {

        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]);
        }
        children.splice(0);

        for (let n = 0; n < predictions.length; n++) {

            if (predictions[n].score > 0.66) {
                const p = document.createElement("p");
                //console.log(typeof(predictions[n].class));
                var translation = translate(predictions[n].class);
                p.innerText = translation + " - mit " +
                    Math.round(parseFloat(predictions[n].score) * 100) +
                    "% Sicherheit";

                p.style = "left: " + predictions[n].bbox[0] + "px;" +
                    "top: " + predictions[n].bbox[1] + "px;" +
                    "width: " + (predictions[n].bbox[2] - 10) + "px;";

                const highlighter = document.createElement("div");
                highlighter.setAttribute("class", "highlighter");
                highlighter.style = "left: " + predictions[n].bbox[0] + "px; top: " +
                    predictions[n].bbox[1] + "px; width: " +
                    predictions[n].bbox[2] + "px; height: " +
                    predictions[n].bbox[3] + "px;";

                liveView.appendChild(highlighter);
                liveView.appendChild(p);

                children.push(highlighter);
                children.push(p);
            }
        }

        window.requestAnimationFrame(predict_webcam);
    });
}

// ZIFFERNERKENNUNG

//https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
//https://developer.mozilla.org/en-US/docs/Web/API/Path2D
//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
//https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

var canvas = document.getElementById("drawing_canvas");
var context = canvas.getContext("2d");

document.addEventListener("DOMContentLoaded", function () {
    var mouse_pos = {
        x: 0,
        y: 0
    };
    var touch_pos = {
        x: 0,
        y: 0
    };
    let is_drawing = false;

    var line_width = 20;

    function resize_canvas() {
        if (window.innerHeight > window.innerWidth) {
            canvas.height = window.innerWidth / 2;
            canvas.width = window.innerWidth / 2; //elif window.innerwidth > x == width/3
        } else {
            canvas.height = window.innerHeight / 3;
            canvas.width = window.innerHeight / 3;
        }
        canvas.style.marginLeft = window.innerWidth / 2 - canvas.width + "px";
        document.getElementById("delete_button").style.marginLeft = window.innerWidth / 2 - canvas.width + "px";
        document.getElementById("prediction_text").style.marginLeft = window.innerWidth / 2 - canvas.width + "px";
        draw(canvas);
    }
    resize_canvas();

    canvas.addEventListener("mousedown", start_drawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop_drawing);
    canvas.addEventListener("mouseout", stop_drawing);

    canvas.addEventListener("touchstart", start_touch_drawing);
    canvas.addEventListener("touchmove", touch_draw);
    canvas.addEventListener("touchend", stop_touch_drawing);

    function get_position(e) {
        mouse_pos.x = e.clientX - canvas.getBoundingClientRect().left;
        mouse_pos.y = e.clientY - canvas.getBoundingClientRect().top;
    }

    function start_drawing(e) {
        is_drawing = true;
        get_position(e);
        draw(e);
    }

    function draw(e) {
        if (!is_drawing) return;

        if (is_drawing) {
            context.beginPath();
            context.lineWidth = line_width;
            context.lineCap = "round";
            context.strokeStyle = "rgb(233, 0, 0)";
            context.moveTo(mouse_pos.x, mouse_pos.y);
            get_position(e);
            context.lineTo(mouse_pos.x, mouse_pos.y);
            context.stroke();
        }
    }

    function stop_drawing() {
        is_drawing = false;
        context.closePath();
        predict();
    }

    function get_touch_position(e) {
        touch_pos.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        touch_pos.y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    }

    function start_touch_drawing(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
        is_drawing = true;
        get_touch_position(e);
        touch_draw(e);
    }

    function touch_draw(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
        if (!is_drawing) return;

        if (is_drawing) {
            context.beginPath();
            context.lineWidth = line_width;
            context.lineCap = "round";
            context.strokeStyle = "rgb(233, 0, 0)";
            context.moveTo(touch_pos.x, touch_pos.y);
            get_touch_position(e);
            context.lineTo(touch_pos.x, touch_pos.y);
            context.stroke();
        }
    }

    function stop_touch_drawing(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
        is_drawing = false;
        context.closePath();
        predict();
    }
});

function delete_canvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

async function loadModel() {
    digit_model = undefined;
    digit_model = await tf.loadGraphModel("models/model.json");
}
loadModel();

async function predict() {
    // var input_canvas = document.createElement("canvas");
    // input_canvas.width = 28;
    // input_canvas.height = 28;
    // var input_context = input_canvas.getContext("2d");
    // input_context.filter = "grayscale(1)"
    // input_context.drawImage(canvas, 0, 0, 28, 28);
    // const imageData = input_context.getImageData(0, 0, 28, 28);
    // const data = imageData.data;
    // var input_array = [];

    // for (var i = 0; i < data.length; i += 4) {
    //     input_array.push(data[i] / 255);
    // }
    // console.log(input_array);
    // digit_model.predict([tf.tensor(input_array).reshape([1, 28, 28, 1])]).array().then(function (scores) {
    //     scores = scores[0];
    //     predicted = scores.indexOf(Math.max(...scores));
    //     console.log(predicted);
    //     document.getElementById("prediction_label").textContent = predicted;
    // });
    const to_predict = tf.browser.fromPixels(canvas).resizeBilinear([28, 28]).mean(2).expandDims().expandDims(3).toFloat().div(255.0);
    const prediction = digit_model.predict(to_predict).dataSync();
    document.getElementById("prediction_label").textContent = tf.argMax(prediction).dataSync();
}


// TIC-TAC-TOE
// Inspiration: https://www.codebrainer.com/blog/tic-tac-toe-javascript-game (genutzt als Basis)

const cells = document.querySelectorAll(".cell");
const status_text = document.getElementById("status_text");
const restart_button = document.getElementById("restart_button");
const win_conditons = [
    [0, 1, 2], // obere Reihe
    [3, 4, 5], // mittlere Reihe
    [6, 7, 8], // untere Reihe
    [0, 3, 6], // linke Spalte
    [1, 4, 7], // mittlere Spalte
    [2, 5, 8], // rechte Spalte
    [0, 4, 8], // Diagonale links
    [2, 4, 6]  // Diagonale rechts
];

let legal_moves = ["", "", "", "", "", "", "", "", ""];
var current_legal_moves = legal_moves;
let human_player = "X";
let ai_player = "O";

let current_player = "X";
let running = false;

var difficulty = "easy";

function select_difficulty(input) {
    difficulty = input;
}

start_game();

function start_game() {
    cells.forEach(cell => cell.addEventListener("click", cell_clicked));
    restart_button.addEventListener("click", restart_game);
    status_text.textContent = `${current_player} ist dran`;
    running = true;
}

function cell_clicked() {
    const cellIndex = this.getAttribute("cell_index");

    if (legal_moves[cellIndex] != "" || !running) {
        return;
    }
    if (current_player == ai_player) {
        return;
    }
    update_cell(this, cellIndex);
    check_for_winner();
}

function update_cell(cell, index) {
    legal_moves[index] = current_player;
    current_legal_moves = legal_moves;
    cell.textContent = current_player;

}

function change_player() {
    console.log(current_player)
    if (current_player == human_player) {
        current_player = ai_player
        if (current_player == "O") {
            if (difficulty == "easy") {
                setTimeout(make_easy_ai_move, 500);
            } if (difficulty == "medium") {
                setTimeout(make_medium_ai_move, 500);
            } if (difficulty == "hard") {
                make_hard_ai_move();
            }
            
        }
    } else {
        current_player = human_player
    }
    status_text.textContent = `${current_player} ist dran`;
}

function make_easy_ai_move() {
    let move = Math.floor(Math.random() * 9);
    let ai_cell = document.getElementById("cell" + move);
    if (legal_moves[move] != "") {
        make_easy_ai_move();
    } else {
        legal_moves[move] = current_player;
        ai_cell.textContent = current_player;
        check_for_winner();
    }
}

function make_medium_ai_move() {
    let move = Math.floor(Math.random() * 9);
    let ai_cell = document.getElementById("cell" + move);
    if (legal_moves[move] != "") {
        make_medium_ai_move();
    } else {
        legal_moves[move] = current_player;
        ai_cell.textContent = current_player;
        check_for_winner();
    }
}

let move_scores = {
    X: -1,
    O: 1,
    tie: 0
};

function evaluate(current_legal_moves) {
    let round_won = false;
    for (let i = 0; i < win_conditons.length; i++) {
        const condition = win_conditons[i]; // i = 0 -> [0, 1, 2] obere Reihe
        const cell_1 = current_legal_moves[condition[0]]; // cell_1 == 0
        const cell_2 = current_legal_moves[condition[1]]; // cell_2 == 1
        const cell_3 = current_legal_moves[condition[2]]; // cell_3 == 2

        if (cell_1 == "" || cell_2 == "" || cell_3 == "") { // (|| <- steht für oder)
            continue; // wenn eine Zelle oder mehrere leer sind neustarten mit i + 1 
        }
        if (cell_1 == cell_2 & cell_2 == cell_3) {
            round_won = true;
            break; // wenn alle Zellen 1 bis 3 gleich sind also z.B. X dann ist die Runde gewonnen
        }
    }
    if (round_won) {
        return current_player;
    } else if (!current_legal_moves.includes("")) {
        return "tie";
    } else {
        return null;
    }
}

function minimax(current_legal_moves, depth, is_maximizing) {
    let result = evaluate(current_legal_moves);
    if (result !== null) {
        let score = move_scores[result]
        return score;
    }
    if (is_maximizing) {
        let best_score = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (current_legal_moves[i] == "") {
                current_legal_moves[i] = ai_player;
                let given_score = minimax(current_legal_moves, depth + 1, false);
                current_legal_moves[i] = "";
                best_score = Math.max(given_score, best_score);
            }
        }
        return best_score;
    } else {
        let best_score = Infinity;
        for (let i = 0; i < 9; i++) {
            if (current_legal_moves[i] == "") {
                current_legal_moves[i] = human_player;
                let given_score = minimax(current_legal_moves, depth + 1, true);
                current_legal_moves[i] = "";
                best_score = Math.min(given_score, best_score);
            }
        }
        return best_score;
    }
}

function best_move() {
    // console.log("best_move")
    let best_score = -Infinity;
    let move_to_make;
    for (let i = 0; i < 9; i++) {
        if (current_legal_moves[i] == "") {
            current_legal_moves[i] = ai_player;
            let given_score = minimax(current_legal_moves, 0, false);
            current_legal_moves[i] = "";
            if (given_score > best_score) {
                best_score = given_score;
                move_to_make = i;
            }
        }
    }
    return move_to_make; 
}

function make_hard_ai_move() {
    if (current_player == human_player) {
        return;
    } else {
        let move = best_move();
        let ai_cell = document.getElementById("cell" + move);
        legal_moves[move] = current_player;
        current_legal_moves = legal_moves;
        ai_cell.textContent = current_player;
        check_for_winner();
    }

}

function check_for_winner() {
    let round_won = false;
    for (let i = 0; i < win_conditons.length; i++) {
        const condition = win_conditons[i]; // i = 0 -> [0, 1, 2] obere Reihe
        const cell_1 = legal_moves[condition[0]]; // cell_1 == 0
        const cell_2 = legal_moves[condition[1]]; // cell_2 == 1
        const cell_3 = legal_moves[condition[2]]; // cell_3 == 2

        if (cell_1 == "" || cell_2 == "" || cell_3 == "") { // (|| <- steht für oder)
            continue; // wenn eine Zelle oder mehrere leer sind neustarten mit i + 1 
        }
        if (cell_1 == cell_2 & cell_2 == cell_3) {
            round_won = true;
            break; // wenn alle Zellen 1 bis 3 gleich sind also z.B. X dann ist die Runde gewonnen
        }
    }
    if (round_won) {
        status_text.textContent = `${current_player} hat gewonnen!`;
        running = false;
        return current_player;
    } else if (!legal_moves.includes("")) {
        status_text.textContent = `Unentschieden!`;
        running = false;
        return "tie";
    } else {
        change_player();
        return null;
    }
}

function restart_game() {
    current_player = "X";
    legal_moves = ["", "", "", "", "", "", "", "", ""];
    status_text.textContent = `${current_player} ist dran`;
    cells.forEach(cell => cell.textContent = "");
    running = true;
}
