// app/transcripts/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuthUtils } from "@/hooks/useAuthUtils";


interface Transcript {
  id: number;
  presentation_id: string;
  transcript_text: string;
  created_at: string;
  presentation_title: string;
  video_url: string;
}

const TranscriptsPage: React.FC = () => {
  const { user, isAuthenticated} = useAuthUtils();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.sub) return;

    const fetchTranscripts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/get-transcripts?userId=${encodeURIComponent(user.sub!)}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setTranscripts(data.transcripts);
        }
      } catch (err) {
        console.error("Error fetching transcripts:", err);
        setError(`Failed to fetch transcripts: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <p>Please log in to view your transcripts.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">My Transcripts</h1>
      {loading && <p>Loading transcripts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {(!loading && transcripts.length === 0) && <p>No transcripts found.</p>}
      <ul className="space-y-4">
        {transcripts.map((transcript) => (
          <li key={transcript.id} className="border rounded p-4">
            <h2 className="text-xl font-semibold">{transcript.presentation_title}</h2>
            <p className="text-sm text-gray-600">Recorded on: {new Date(transcript.created_at).toLocaleString()}</p>
            <div className="mt-2 p-2 bg-gray-100 rounded">
              {transcript.transcript_text}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TranscriptsPage;
