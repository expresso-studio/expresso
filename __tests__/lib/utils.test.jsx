// utils.test.jsx
import {
    cn,
    transformMetricsToGestureMetrics,
    getMetricStatus,
    transformMetricsToAnalysisData,
    generateRecommendations,
    getWordColorClass,
    getWordColorHex,
} from "@/lib/utils";
import { OPTIMAL_RANGES } from "@/lib/constants";

describe("cn", () => {
    test("merges class names correctly", () => {
        const result = cn("class1", "class2", ["class3", "class4"]);
        expect(result).toEqual(expect.stringContaining("class1"));
        expect(result).toEqual(expect.stringContaining("class2"));
        expect(result).toEqual(expect.stringContaining("class3"));
        expect(result).toEqual(expect.stringContaining("class4"));
    });
});

describe("transformMetricsToGestureMetrics", () => {
    test("transforms an array of metrics into a GestureMetrics object", () => {
        const metrics = [
            { metric_id: 1, name: "HandMovement", score: 75, evaluated_at: "2020-01-01" },
            { metric_id: 2, name: "Posture", score: 50, evaluated_at: "2020-01-01" },
        ];
        const gestureMetrics = transformMetricsToGestureMetrics(metrics);
        expect(gestureMetrics.HandMovement).toBe(75);
        expect(gestureMetrics.Posture).toBe(50);
        expect(gestureMetrics.HeadMovement).toBe(0);
    });
});

describe("getMetricStatus", () => {
    test("returns 'Poor', 'Fair', or 'Good' for Posture", () => {
        expect(getMetricStatus("Posture", 0.2)).toBe("Poor");
        expect(getMetricStatus("Posture", 0.5)).toBe("Fair");
        expect(getMetricStatus("Posture", 0.8)).toBe("Good");
    });

    test("returns 'Low', 'Normal', or 'High' for other metrics", () => {
        const range = OPTIMAL_RANGES["HandMovement"];
        expect(getMetricStatus("HandMovement", range.min - 1)).toBe("Low");
        const midValue = (range.min + range.max) / 2;
        expect(getMetricStatus("HandMovement", midValue)).toBe("Normal");
        expect(getMetricStatus("HandMovement", range.max + 1)).toBe("High");
    });
});

describe("transformMetricsToAnalysisData", () => {
    test("transforms metrics array into AnalysisData object", () => {
        const metrics = [
            { name: "HandMovement", score: 60 },
            { name: "OverallScore", score: 85 },
            { name: "Posture", score: 0.2 },
        ];
        const analysisData = transformMetricsToAnalysisData(metrics);
        expect(analysisData.OverallScore).toBe(85);
        expect(analysisData.HandMovement.value).toBe(60);
        expect(analysisData.HandMovement.status).toBe(getMetricStatus("HandMovement", 60));
        expect(analysisData.Posture.value).toBe(0.2);
        expect(analysisData.Posture.status).toBe(getMetricStatus("Posture", 0.2));
        expect(analysisData.HeadMovement.value).toBe(0);
        expect(analysisData.HeadMovement.status).toBe("Low");
    });
});

describe("generateRecommendations", () => {
    test("returns recommendation for low HandMovement", () => {
        const analysisData = {
            HandMovement: { value: 10, status: "Low" },
            HeadMovement: { value: 0, status: "Low" },
            BodyMovement: { value: 0, status: "Low" },
            Posture: { value: 0.8, status: "Good" },
            HandSymmetry: { value: 0, status: "Low" },
            GestureVariety: { value: 0, status: "Low" },
            EyeContact: { value: 0, status: "Normal" },
            OverallScore: 0,
            sessionDuration: 0,
            transcript: "",
        };
        const recommendations = generateRecommendations(analysisData);
        expect(recommendations).toContain(
            "Use more hand gestures to emphasize key points and engage your audience."
        );
    });

    test("returns recommendation for high HandMovement", () => {
        const analysisData = {
            HandMovement: { value: 100, status: "High" },
            HeadMovement: { value: 0, status: "Low" },
            BodyMovement: { value: 0, status: "Low" },
            Posture: { value: 0.8, status: "Good" },
            HandSymmetry: { value: 0, status: "Low" },
            GestureVariety: { value: 0, status: "Low" },
            EyeContact: { value: 0, status: "Normal" },
            OverallScore: 0,
            sessionDuration: 0,
            transcript: "",
        };
        const recommendations = generateRecommendations(analysisData);
        expect(recommendations).toContain(
            "Try to reduce excessive hand movements as they may distract from your message."
        );
    });

    test("returns recommendation for poor or fair Posture", () => {
        const analysisDataPoor = {
            HandMovement: { value: 50, status: "Normal" },
            HeadMovement: { value: 0, status: "Low" },
            BodyMovement: { value: 0, status: "Low" },
            Posture: { value: 0.2, status: "Poor" },
            HandSymmetry: { value: 0, status: "Normal" },
            GestureVariety: { value: 0, status: "Normal" },
            EyeContact: { value: 0, status: "Normal" },
            OverallScore: 0,
            sessionDuration: 0,
            transcript: "",
        };
        const recPoor = generateRecommendations(analysisDataPoor);
        expect(recPoor).toContain(
            "Work on maintaining better posture by keeping your back straight and shoulders level."
        );
        const analysisDataFair = {
            ...analysisDataPoor,
            Posture: { value: 0.5, status: "Fair" },
        };
        const recFair = generateRecommendations(analysisDataFair);
        expect(recFair).toContain(
            "Work on maintaining better posture by keeping your back straight and shoulders level."
        );
    });

    test("returns recommendation for low EyeContact", () => {
        const analysisData = {
            HandMovement: { value: 50, status: "Normal" },
            HeadMovement: { value: 0, status: "Low" },
            BodyMovement: { value: 0, status: "Low" },
            Posture: { value: 0.8, status: "Good" },
            HandSymmetry: { value: 0, status: "Normal" },
            GestureVariety: { value: 0, status: "Normal" },
            EyeContact: { value: 10, status: "Low" },
            OverallScore: 0,
            sessionDuration: 0,
            transcript: "",
        };
        const recommendations = generateRecommendations(analysisData);
        expect(recommendations).toContain(
            "Maintain more consistent Eye contact with the camera to better connect with your audience."
        );
    });

    test("returns recommendation for low HandSymmetry", () => {
        const analysisData = {
            HandMovement: { value: 50, status: "Normal" },
            HeadMovement: { value: 0, status: "Low" },
            BodyMovement: { value: 0, status: "Low" },
            Posture: { value: 0.8, status: "Good" },
            HandSymmetry: { value: 10, status: "Low" },
            GestureVariety: { value: 0, status: "Normal" },
            EyeContact: { value: 0, status: "Normal" },
            OverallScore: 0,
            sessionDuration: 0,
            transcript: "",
        };
        const recommendations = generateRecommendations(analysisData);
        expect(recommendations).toContain(
            "Try to use both hands more equally for a balanced presentation style."
        );
    });

    test("returns recommendation for low GestureVariety", () => {
        const analysisData = {
            HandMovement: { value: 50, status: "Normal" },
            HeadMovement: { value: 0, status: "Low" },
            BodyMovement: { value: 0, status: "Low" },
            Posture: { value: 0.8, status: "Good" },
            HandSymmetry: { value: 50, status: "Normal" },
            GestureVariety: { value: 10, status: "Low" },
            EyeContact: { value: 0, status: "Normal" },
            OverallScore: 0,
            sessionDuration: 0,
            transcript: "",
        };
        const recommendations = generateRecommendations(analysisData);
        expect(recommendations).toContain(
            "Incorporate a wider variety of gestures to keep your presentation engaging."
        );
    });

    test("returns default recommendation when no conditions are met", () => {
        const analysisData = {
            HandMovement: { value: 50, status: "Normal" },
            HeadMovement: { value: 50, status: "Normal" },
            BodyMovement: { value: 50, status: "Normal" },
            Posture: { value: 0.8, status: "Good" },
            HandSymmetry: { value: 50, status: "Normal" },
            GestureVariety: { value: 50, status: "Normal" },
            EyeContact: { value: 50, status: "Normal" },
            OverallScore: 50,
            sessionDuration: 0,
            transcript: "",
        };
        const recommendations = generateRecommendations(analysisData);
        expect(recommendations).toContain(
            "Your presentation skills are solid! Continue practicing to maintain consistency."
        );
    });
});

describe("getWordColorClass", () => {
    test("returns correct classes for given statuses", () => {
        expect(getWordColorClass("Low")).toBe("text-red-500");
        expect(getWordColorClass("High")).toBe("text-amber-500");
        expect(getWordColorClass("Normal")).toBe("text-blue-500");
        expect(getWordColorClass("Good")).toBe("text-green-500");
        expect(getWordColorClass("Fair")).toBe("text-yellow-500");
        expect(getWordColorClass("Poor")).toBe("text-red-500");
        expect(getWordColorClass("Unknown")).toBe("text-gray-500");
    });
});

describe("getWordColorHex", () => {
    test("returns correct hex codes for given statuses", () => {
        expect(getWordColorHex("Low")).toBe("#EF4444");
        expect(getWordColorHex("High")).toBe("#F59E0B");
        expect(getWordColorHex("Normal")).toBe("#3B82F6");
        expect(getWordColorHex("Good")).toBe("#10B981");
        expect(getWordColorHex("Fair")).toBe("#FBBF24");
        expect(getWordColorHex("Poor")).toBe("#EF4444");
        expect(getWordColorHex("Unknown")).toBe("#6B7280");
    });
});
