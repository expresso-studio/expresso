"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { Button } from "@/components/ui/button";

export default function Page() {

    const[questions, setQuestion] = useState([]);
    const[currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch("/api/openai_qna");
                const data = await response.json();
                if(response.ok) {
                    setQuestion(data.questions || "no question generated.");
                } else {
                    setQuestion("Failed to fetch question.");
                }
            } catch (error) {
                console.error("Error fetching question: ", error);
                setQuestion("Error fetching question.");
            }
        }

        fetchQuestions();
    }, []);

    const nextQuestion = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
    };

    return (
    <PageFormat breadCrumbs={[{ name: "qna" }]}>
        <Heading1 id="qna">qna</Heading1>
        <p>Question: {questions[currentIndex]}</p>
        <Button onClick={nextQuestion}>Next Question</Button>
    </PageFormat>
    );
}
