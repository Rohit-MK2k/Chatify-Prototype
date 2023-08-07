import React, { useRef, useEffect } from 'react'
import Webcam from 'react-webcam'
import { ChatState } from "../Context/ChatProvider";
import * as tf from '@tensorflow/tfjs'
const blazeface = require("@tensorflow-models/blazeface");

function Emotion() {
    const {
        showEmotion,
        setTextBtn,
        setEmotionIndex,
    } = ChatState();
    
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const condition = (showEmotion === 'Show my emotion')
   

    const loadModel = async () => {
        // Load the Keras model using TensorFlow.js
        const model_URL = 'https://tensorflowmodelandweight.blob.core.windows.net/model/model/tsjsModel/model.json'
        const weight_URL = 'https://tensorflowmodelandweight.blob.core.windows.net/weight/weights/tsjsWeight/model.json'
        try {
            const model = await tf.loadLayersModel(model_URL, weight_URL);
            const face_model = await blazeface.load()
            
            console.log(condition)
            const interval = setInterval(() => {emotionDetection(model, face_model)}, 16.7)
            if (condition) {
                clearInterval(interval)
            }
        }
        catch (err) {
            console.log(err.message)
            setTextBtn("Show my emotion")
        } 
    }
    function indexOfMax(arr) {
        if (arr.length === 0) {
            return -1; // Return -1 for an empty array
        }

        let max = arr[0];
        let maxIndex = 0;

        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
            max = arr[i];
            maxIndex = i;
            }
        }

        return maxIndex;
    }
    const predEmotion = async (x, y, w, h, gray_frame, model) => {
        // const casted = gray_frame.cast('int32')
        // console.log(casted.shape)
        // const roi_gray_frame = casted.slice([y, x], [h, w])
        const resized = tf.image.resizeBilinear (gray_frame, [48,48])
        const expandedTo = resized.expandDims(0)
        // const expanded = expandedTo.expandDims(-1)
        const pred = model.predict(expandedTo)
        const arr = pred.dataSync()
        setEmotionIndex(indexOfMax(arr))

        tf.dispose(resized)
        // tf.dispose(casted)
        tf.dispose(expandedTo)
        // tf.dispose(roi_gray_frame)
    }
    const grayFrame = (video) => {
        const img = tf.browser.fromPixels(video)
        const grayscaleImage = tf.image.rgbToGrayscale(img);
        return grayscaleImage
    }

    const emotionDetection = async (model, face_model) => {
        console.log("yes")
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;
            // Set video width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;
            tf.setBackend('cpu')
            // Set canvas height and width
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            
            
            // const casted = resized.cast('int32')
            const gray_frame = grayFrame(video)
            const face_detector = await face_model.estimateFaces(video, false)
            face_detector.forEach((pred) => {
                const x = pred.topLeft[0]
                const y = pred.topLeft[1]
                const w = pred.bottomRight[0] - pred.topLeft[0]
                const h = pred.bottomRight[1] - pred.topLeft[1]
                predEmotion(x,y,w,h,gray_frame,model)
            })            
            tf.dispose(face_detector)

        }
    }
    useEffect(() => {
         loadModel()
    },[,showEmotion])

    if (condition) {
        return (
            <></>
        )
    }
    else {
        return (
            <>
                <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
              visibility: "hidden",
              position: "absolute",
              zindex: "-1", 
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
             visibility: "hidden",
              position: "absolute",
              zindex: "-1",
          }}
        />
            </>
        )
    }
}

export default Emotion