"use client";
import PageFormat from "@/components/page-format";
import { Textarea } from "@/components/ui/textarea";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import FooterWave from "@/components/ui/footer-wave";
import {
  ImageUp,
  Camera,
  ArrowRight,
  Laptop,
  PersonStanding,
  Presentation,
  Users,
  X,
} from "lucide-react";
import { useScript } from "@/context/ScriptContext";

type FormData = {
  topic: string;
  location: string;
  HandMovement: boolean;
  HeadMovement: boolean;
  BodyMovement: boolean;
  Posture: boolean;
  HandSymmetry: boolean;
  GestureVariety: boolean;
  EyeContact: boolean;
};

export default function Page() {
  const router = useRouter();
  const [localScript, setLocalScript] = useState("");
  const { setScript } = useScript();

  const [formData, setFormData] = useState<FormData>({
    topic: "",
    location: "",
    HandMovement: false,
    HeadMovement: false,
    BodyMovement: false,
    Posture: false,
    HandSymmetry: false,
    GestureVariety: false,
    EyeContact: false,
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handlePersonaSelect = (persona: string) => {
    setSelectedPersona(persona);
    if (persona === "class-presentation") {
      setFormData((prev) => ({
        ...prev,
        location: "classroom",
        HandMovement: true,
        HeadMovement: true,
        BodyMovement: true,
        Posture: true,
        HandSymmetry: true,
        GestureVariety: true,
        EyeContact: true,
      }));
    } else if (persona === "none") {
      // Clear all selections for none mode
      setFormData((prev) => ({
        ...prev,
        location: "",
        HandMovement: false,
        HeadMovement: false,
        BodyMovement: false,
        Posture: false,
        HandSymmetry: false,
        GestureVariety: false,
        EyeContact: false,
      }));
    } else if (persona === "online") {
      setFormData((prev) => ({
        ...prev,
        location: "online",
        HandMovement: false,
        HeadMovement: true,
        BodyMovement: false,
        Posture: false,
        HandSymmetry: false,
        GestureVariety: false,
        EyeContact: true,
      }));
    } else if (persona === "meeting") {
      setFormData((prev) => ({
        ...prev,
        location: "meeting",
        HandMovement: true,
        HeadMovement: true,
        BodyMovement: false,
        Posture: false,
        HandSymmetry: false,
        GestureVariety: true,
        EyeContact: true,
      }));
    } else if (persona === "lecture") {
      setFormData((prev) => ({
        ...prev,
        location: "Classroom",
        HandMovement: true,
        HeadMovement: true,
        BodyMovement: false,
        Posture: true,
        HandSymmetry: false,
        GestureVariety: true,
        EyeContact: true,
      }));
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (e.target instanceof HTMLInputElement) {
      const { name, value, checked } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: e.target.type === "checkbox" ? checked : value,
      }));
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const isFormValid = () => {
    return !!selectedOption && !!formData.topic;
  };

  const handleStart = () => {
    if (!isFormValid()) {
      if (!selectedOption) {
        alert("Please Select Practice Now or Upload Video");
      } else {
        alert("Please Provide Presentation Topic");
      }
      return;
    }

    const { topic, ...rest } = formData;

    // topic + script into one, save to context
    const finalScript = `Topic:${topic}\n\nScript:${localScript}`.trim();
    setScript(finalScript);

    console.log("sending final: ", finalScript);

    // Builds URL with all true metrics
    const query = new URLSearchParams(
      Object.entries(rest)
        .filter(([, v]) => v !== "")
        .map(([key, value]) => [key, String(value)])
    ).toString();

    if (selectedOption === "practice") {
      router.push(`/dashboard/evaluate?${query}`);
    } else if (selectedOption === "upload") {
      router.push(`/dashboard/upload-video?${query}`);
    }
  };

  return (
    <PageFormat breadCrumbs={[{ name: "Evaluation Settings" }]}>
      <div className="flex flex-col min-h-screen px-4 items-center">
        <form className="w-full max-w-[800px] px-8 pb-8 pt-0 rounded-lg">
          <div className="flex flex-col gap-4 mb-4">
            <p className="text-lg font-medium">
              Select Option: <span className="text-red-500">*</span>
            </p>
            <button
              type="button"
              onClick={() => handleOptionSelect("practice")}
              className={`p-4 rounded-lg flex flex-row items-center justify-start 
                                transition ${
                                  selectedOption === "practice"
                                    ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                                    : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
                                } hover:bg-[#F8AC78]`}
            >
              <Camera className="mr-4 ml-2" />
              Practice Now
            </button>
            <button
              type="button"
              onClick={() => handleOptionSelect("upload")}
              className={`p-4 rounded-lg flex flex-row items-center justify-start
                                transition ${
                                  selectedOption === "upload"
                                    ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                                    : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
                                } hover:bg-[#F8AC78]`}
            >
              <ImageUp className="mr-4 ml-2" />
              Upload Video
            </button>
          </div>

          <div className="mb-4">
            <label>
              Presenting Topic: <span className="text-red-500">*</span>
              <Textarea
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Enter a topic, keywords, or description in any format you want."
                required
              />
            </label>
          </div>

          <div className="w-full max-w-[800px]">
            <p className="text-lg font-medium">Select preset persona:</p>
          </div>
          <div className="w-full max-w-[800px] grid grid-cols-2 gap-x-8 gap-y-6 mb-2">
            <button
              type="button"
              onClick={() => handlePersonaSelect("class-presentation")}
              className={`px-3 py-6 rounded-lg flex items-center justify-center text-lg font-medium ${
                selectedPersona === "class-presentation"
                  ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                  : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
              } hover:bg-[#F8AC78]`}
            >
              <PersonStanding className="w-10 h-10 mx-2" />
              Class Presentation
            </button>
            <button
              type="button"
              onClick={() => handlePersonaSelect("meeting")}
              className={`px-3 py-6 rounded-lg flex items-center justify-center text-lg font-medium ${
                selectedPersona === "meeting"
                  ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                  : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
              } hover:bg-[#F8AC78]`}
            >
              <Users className="w-10 h-10 mx-2" />
              In-person Meeting
            </button>
            <button
              type="button"
              onClick={() => handlePersonaSelect("online")}
              className={`px-3 py-6 rounded-lg flex items-center justify-center text-lg font-medium ${
                selectedPersona === "online"
                  ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                  : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
              } hover:bg-[#F8AC78]`}
            >
              <Laptop className="w-10 h-10 mx-2" />
              Online Presentation
            </button>
            <button
              type="button"
              onClick={() => handlePersonaSelect("lecture")}
              className={`px-3 py-6 rounded-lg flex items-center justify-center text-lg font-medium ${
                selectedPersona === "lecture"
                  ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                  : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
              } hover:bg-[#F8AC78]`}
            >
              <Presentation className="w-10 h-10 mx-2" />
              Lecture
            </button>
            <button
              type="button"
              onClick={() => handlePersonaSelect("none")}
              className={`px-3 py-6 rounded-lg flex items-center justify-center text-lg font-medium ${
                selectedPersona === "none"
                  ? "bg-[#F8AC78] text-black dark:bg-[#CA773F] dark:text-white"
                  : "bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white dark:hover:bg-[#CA773F]"
              } hover:bg-[#F8AC78]`}
            >
              <X className="w-10 h-10 mx-2" />
              None
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium">
              Location:
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select location
                </option>
                <option value="classroom">Classroom</option>
                <option value="online">Online</option>
                <option value="meeting">In-person Meeting Room</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className="mb-4">
            <fieldset>
              <legend>Evaluation Metrics</legend>
              {(
                [
                  "HandMovement",
                  "HeadMovement",
                  "BodyMovement",
                  "Posture",
                  "HandSymmetry",
                  "GestureVariety",
                  "EyeContact",
                ] as const
              ).map((key) => (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    name={key}
                    checked={formData[key]}
                    onChange={handleChange}
                  />
                  {key
                    .replace(/(?<!^)([A-Z][a-z])/g, " $1")
                    .charAt(0)
                    .toUpperCase() +
                    key.replace(/(?<!^)([A-Z][a-z])/g, " $1").slice(1)}
                </label>
              ))}
            </fieldset>
          </div>

          <div className="mb-4">
            Enter Script:
            <div className="w-full max-w-100 mb-4">
              <textarea
                value={localScript}
                onChange={(e) => setLocalScript(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Paste your presentation script here..."
                rows={10}
              />
            </div>
            {/* <div>
                                <button
                                    type="button"
                                    className="flex flex-row items-center px-4 py-2 bg-gray-200 text-black dark:bg-[#311E13] dark:text-white rounded-lg"
                                    // This button could trigger additional client-side actions, such as previewing or saving to state.
                                    onClick={() => console.log("Script saved in context:", script)}
                                >
                                    <Upload className="mr-1" />
                                    Save Script
                                </button>
                            </div> */}
          </div>

          <div className="mt-6">
            <div className="p-2 rounded-lg space-y-4 justify-self-end">
              <button
                type="button"
                onClick={handleStart}
                className={`px-4 py-2 rounded-lg flex row bg-[#ffffff] text-black dark:bg-[#1D1816] dark:text-white
                                    hover:bg-[#F8AC78] dark:hover:bg-[#CA773F]
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
              >
                Start
                <ArrowRight className="ml-1" />
              </button>
            </div>
          </div>
        </form>
      </div>
      <FooterWave />
    </PageFormat>
  );
}
