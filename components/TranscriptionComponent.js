import { useState, useEffect, useRef } from 'react';

function TranscriptionComponent() {
  const [transcript, setTranscript] = useState('');
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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Browser does not support Speech Recognition');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const speechResult = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + speechResult + ' ');
        } else {
          interimTranscript += speechResult;
        }
      }
      console.log('Interim Transcript:', interimTranscript);
    };

    recognition.start();
    initMedia();

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
        <p>{transcript}</p>
      </div>
    </div>
  );
}

export default TranscriptionComponent;
