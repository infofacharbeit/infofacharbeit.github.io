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

    video_box = window.innerWidth - 12;
    
    const constraints = {
        video: {
            facingMode: {
                exact: "environment"
            },
            width: video_box,
            height: video_box
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict_webcam);
    });
    document.getElementById("disable_cam_button").classList.remove("removed");
}

function disable_cam() {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
        track.stop();
    });

    video.srcObject = null;
    document.getElementById("disable_cam_button").classList.add("removed");
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
