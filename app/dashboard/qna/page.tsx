"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import {ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "@/components/loading";

interface Question {
    question: string;
    tips: string;
}

export default function Page() {

    const [questions, setQuestions] = useState<Question[]>([]);
    const[currentIndex, setCurrentIndex] = useState(0);
    const {user, isAuthenticated, isLoading} = useAuthUtils();
    const [title, setTitle] = useState<string>('Trial 1');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTips, setShowTips] = useState(false);
   
    const searchParams = useSearchParams()!;
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
                const transcriptData = data.transcript[0]?.transcript_text || '';
                const titleData = data.transcript[0]?.title || '';
                const scriptData = data.script[0]?.script_text || '';
                
                setTitle(titleData);

                const qnaRes = await fetch("/api/openai_qna", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ transcriptData, scriptData }),
                });
                  
                const qnaData = await qnaRes.json();
                if (Array.isArray(qnaData.questions)) {
                    setQuestions(qnaData.questions);
                } else {
                    setQuestions([]);
                }
            } catch (err) {
                console.error("Error fetching transcript and scipt:", err);
                setError(`Failed to fetch transcripts: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            } 
        };
        fetchData();
    }, [isLoading, isAuthenticated, user?.sub, presentationID, searchParams]);

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
        setShowTips(false);
    };

    const nextQuestion = () => {
        setCurrentIndex((prevIndex) => (prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex));
        setShowTips(false);
    };

    return (
        <PageFormat breadCrumbs={[{ name: "qna" }]}>
            <Heading1 id = "presentation_title">{title} QnA</Heading1>
            <p>
                Below are questions provided for you to practice answering questions the audience may have. <br />
                Feel free to click to see hints on how to approach answering the question.
            </p>
            <p></p>
            <div className = "flex flex-col gap-4 h-screen">
                <div className = {`flex items-center justify-center w-[min(100%,800px)]
                    max-h-[50px] min-h-[50px] bg-lightCaramel dark:bg-darkCaramel mb-0 p-4 mx-auto text-xl`}>
                    <p>{title}</p>
                </div>
                <div className = {`w-[min(100%,800px)] h-[min(100%,500px)] mx-auto p-16 
                    bg-[#F8D1B7] dark:text-white dark:bg-[#311E13]
                    rounded-lg flex flex-col text-xl`}>
                    <p>Question {currentIndex + 1}: </p>
                    <p>{questions[currentIndex].question}</p>
                    {error && (
                        <p className="text-red-500 text-sm mt-2">
                            {error}
                        </p>
                    )}
                    <div
                        className="w-full p-8 h-[150px] flex justify-center items-center 
                        bg-[#F8AC78] dark:bg-[#936648] my-auto cursor-pointer rounded-lg"
                        onClick={() => setShowTips(true)}
                    >
                        <p className="text-black dark:text-white ">
                            {showTips ? questions[currentIndex].tips : "Click to reveal tips"}
                        </p>
                    </div>
                    <div className = "flex justify-between w-full mx-auto pt-4 mt-auto">
                        <Button onClick={prevQuestion} disabled = {currentIndex <= 0}>
                            <ChevronLeft/>
                        </Button>

                        <div className="flex space-x-4 items-center">
                            {questions.map((_, index) => (
                            <div
                                key={index}
                                className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-black dark:bg-lightCream' : ' bg-lightCream dark:bg-black'}`}
                            />
                            ))}
                        </div>
                        <Button onClick={nextQuestion} disabled = {currentIndex >= questions.length - 1}>
                            <ChevronRight/>
                        </Button>
                    </div>
                </div>
            </div>
        </PageFormat>
    );
}
