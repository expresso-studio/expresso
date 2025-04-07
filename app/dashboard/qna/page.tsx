"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import Loading from "@/components/loading";


export default function Page() {

    const[questions, setQuestions] = useState([]);
    const[currentIndex, setCurrentIndex] = useState(0);
    const {user, isAuthenticated, isLoading} = useAuthUtils();
    const [transcript, setTranscript] = useState<string>('');
    const [script, setScript] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
   
    const searchParams = useSearchParams();
    if(!searchParams) {
        return <div>Missing presentation ID</div>;
    }
    const presentationID = searchParams.get("id");


    useEffect(() => {

        if (isLoading || !isAuthenticated || !user?.sub || !searchParams) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/get-qna-info?userId=${encodeURIComponent(user.sub!)}&id=${presentationID}`);
                const data = await res.json();
                
                if (data.error) {
                    setError(data.error);
                    throw new Error(data.error);
                }
                setTranscript(data.transcript[0]?.transcript_text || '');
                setTitle(data.transcript[0]?.title || '');
                setScript(data.script[0]?.script_text || '');

                // const qnaRes = await fetch("/api/openai_qna", {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify({ transcript: data.transcript }),
                // });
          
                // const qnaData = await qnaRes.json();
                //     if (Array.isArray(qnaData.questions)) {
                //         setQuestions(qnaData.questions);
                //     } else {
                //         setQuestions([]);
                // }
            } catch (err) {
                console.error("Error fetching transcript and scipt:", err);
                setError(`Failed to fetch transcripts: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            } 
        };
        fetchData();
    }, [isLoading, isAuthenticated, user?.sub, presentationID]);

    if (loading || isLoading) {
        return <Loading />;
    }

    if (!isAuthenticated || !user?.sub) {
        return (
            <div className="w-full h-full items-center justify-center">
                Please log in to view this presentation.
            </div>
        );
    }

    if (!presentationID) {
        return (
            <div className="w-full h-full items-center justify-center">
                Presentation not found.
            </div>
        );
    }

    const prevQuestion = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    };

    const nextQuestion = () => {
        setCurrentIndex((prevIndex) => (prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex));
    };


    return (
        <PageFormat breadCrumbs={[{ name: "qna" }]}>
            <Heading1 id = "presentation_title">{title} QnA</Heading1>
            <p>Transcript: {transcript}</p>
            <p>Script: {script}</p>
            <p>Question: {questions[currentIndex]}</p>
            <div className = "flex justify-between w-full max-w-md mx-auto">
                <Button onClick={prevQuestion} disabled = {currentIndex <= 0}>
                    Last Question
                </Button>
                <Button onClick={nextQuestion} disabled = {currentIndex >= questions.length - 1}>
                    Next Question
                </Button>
            </div>
        </PageFormat>
    );
}
