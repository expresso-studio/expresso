"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { Button } from "@/components/ui/button";

export default function Page() {

    const[questions, setQuestions] = useState([]);
    const[currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch("/api/openai_qna");
                const data = await response.json();
                if(response.ok) {
                    // setQuestions(data.questions || []);
                    setQuestions(Array.isArray(data.questions) ? data.questions : []);
                } else {
                    setQuestions([]);
                }
            } catch (error) {
                console.error("Error fetching question: ", error);
                setQuestions([]);
            }
        }

        fetchQuestions();
    }, []);

    const prevQuestion = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    };

    const nextQuestion = () => {
        setCurrentIndex((prevIndex) => (prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex));
    };

    return (
    <PageFormat breadCrumbs={[{ name: "qna" }]}>
        <Heading1 id="qna">qna</Heading1>
        <p>Question: {questions[currentIndex]}</p>
        <Button onClick={prevQuestion} disabled = {currentIndex <= 0}>
            Last Question
        </Button>
        <Button onClick={nextQuestion} disabled = {currentIndex >= questions.length - 1}>
            Next Question
        </Button>
    </PageFormat>
    );
}
