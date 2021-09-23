import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { speak } from 'expo-speech';

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet'

export function ImageDetector() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [predictions, setPredictions] = useState('');
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [model, setModel] = useState(null)
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    (async () => {
      await tf.ready();
      console.log('TensorFlow ready');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })();
  }, []);

  useEffect(() => {
    (async function () {
        tf.getBackend();
        const net = await mobilenet.load()
        setModel(net)
        console.log('Model loaded')
    })()   
  }, []);

  useEffect(() => {
    let interval = null;
    if (cameraReady && model) {
      interval = setInterval(() => {
        cameraRef.current.takePictureAsync({ base64: true }).then(data => {
          setImageUri(data.uri);
        })

      }, 10000)
    }
    return () => interval && clearInterval(interval);
  }, [cameraReady, model]);

  useEffect(() => {
    if (predictions && predictions.length) {
      speak(predictions)
    }
  }, [predictions])

  useEffect(() => {
    if (imageUri && model) {
      const image = new Image();
      image.src = imageUri;
      image.crossOrigin = 'Anonymous';
      image.onload = () => {
        model.classify(image).then(predictions => {
          if (predictions && predictions.length) {
            setPredictions(predictions[0].className);
          } else {
            setPredictions('');
          }
          setPredictions(predictions[0].className)
        })
      }
    }
  }, [imageUri, model])

  if (hasPermission === null) {
    return <View />
  }
  if (hasPermission === false) {
    speak('No access to camera.');
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        onCameraReady={() => setCameraReady(true)}
      >
        <View style={styles.body}/>
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}>
              <Text style={styles.text}> Flip </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.predictionContainer}>
            <Text style={styles.text}> {predictions} </Text>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  body: {
    flex: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  predictionContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
  },
  footer: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});

