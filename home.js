const video = document.getElementById("video");
let predictedAges=[];
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(startvideo);

function startvideo(){
    navigator.getUserMedia(
        { video: {} },
        stream => (video.srcObject =stream),
        err => console.error(err)
    )
}

video.addEventListener("playing", () => { //playing is the event // and it is followed by function()
    const canvas = faceapi.createCanvasFromMedia(video);
    let container=document.querySelector(".container");
    container.append(canvas);

    const displaysize = { width: video.width,height:video.height};
    faceapi.matchDimensions(canvas,displaysize);
    setInterval( async() =>{                    //async used to return promise  -->refer w3
        const detections = await faceapi
        .detectAllFaces(video,new faceapi.TinyFaceDetectorOptions())
        
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
        const resizeDetections = faceapi.resizeResults(detections,displaysize);
        canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height); //to avoid messy boxes

        faceapi.draw.drawDetections(canvas ,resizeDetections);
        faceapi.draw.drawFaceLandmarks(canvas ,resizeDetections);
        faceapi.draw.drawFaceExpressions(canvas ,resizeDetections);
        
        const age = resizeDetections[0] .age;
        const interpolatedage= interPolateAgePredictions(age);
        const bottomRight ={
            x: resizeDetections[0].detection.box.bottomRight.x - 50,
            y: resizeDetections[0].detection.box.bottomRight.y
        };

        new faceapi.draw.DrawTextField(
            [`${faceapi.utils.round(interpolatedage, 0)}years`],
            bottomRight
        ).draw(canvas);



        
    }, 100);
});

function interPolateAgePredictions(age){
    predictedAges=[age].concat(predictedAges).slice(0,30);   //it predict ages from 0-30
    const avgpredictedage=
    predictedAges.reduce((total,a) => total+a) / predictedAges.length;
    return avgpredictedage;
}


