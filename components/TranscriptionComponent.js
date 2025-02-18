import { useState, useEffect, useRef } from 'react';

function TranscriptionComponent() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    }
    initMedia();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Your browser does not support Speech Recognition.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript(prev => prev + result[0].transcript + ' ');
          setInterimTranscript('');
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.start();

    return () => {
      recognition.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h1>Live Transcription</h1>
      <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '600px' }} />
      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
        <strong>Transcript:</strong>
        <p>
          {transcript}
          <span style={{ opacity: 0.6 }}>{interimTranscript}</span>
        </p>
      </div>
    </div>
  );
}

export default TranscriptionComponent;