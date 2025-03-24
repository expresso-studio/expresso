"use client"
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import FooterWave from "@/components/ui/footer-wave";
import { ImageUp, Camera } from "lucide-react";
 
type FormData = {
    topic: string
    attendees: string
    location: string
    handMovement: boolean
    headMovement: boolean
    bodyMovement: boolean
    posture: boolean
    handSymmetry: boolean
    gestureVariety: boolean
    eyeContact: boolean
}

export default function Page() {
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        topic: '',
        attendees: '',
        location: '',
        handMovement: false,
        headMovement: false,
        bodyMovement: false,
        posture: false,
        handSymmetry: false,
        gestureVariety: false,
        eyeContact: false
    })

    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handlePersonaSelect = (persona: string) => {
        if (persona === 'class-presentation') {
            setFormData(prev => ({
                ...prev,
                handMovement: true,
                headMovement: true,
                bodyMovement: false,
                posture: true,
                handSymmetry: false,
                gestureVariety: true,
                eyeContact: true,
            }));
        } else if (persona === 'none') {
            // Clear all selections for custom mode
            setFormData(prev => ({
                ...prev,
                handMovement: false,
                headMovement: false,
                bodyMovement: false,
                posture: false,
                handSymmetry: false,
                gestureVariety: false,
                eyeContact: false,
            }));
        }
    };
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
    };

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    const handleStart = () => {
        if(!selectedOption) {
            alert('Please select an option');
            return;
        }

        // Builds URL with all true metrics
        const query = new URLSearchParams(
            Object.entries(formData)
              .filter(([_, v]) => v !== '' && v !== false)
              .map(([key, value]) => [key, String(value)]) 
        ).toString();
        
        if (selectedOption === 'practice') {
            router.push(`/dashboard/evaluation?${query}`);
            } else if (selectedOption === 'upload') {
            router.push(`/dashboard/upload-video?${query}`);
        }
    };
    

    return(
        <PageFormat breadCrumbs={[{ name: "Evaluation Settings" }]}>
            <div className = "flex flex-col min-h-screen px-4 items-center">                    
                <div className="w-full max-w-[800px]">
                    <p className="text-lg font-medium">Select pre‑set persona:</p>
                </div>
                <div className = "w-full max-w-[800px] grid grid-cols-2 gap-4 mb-2">
                    <button
                        type="button"
                        onClick={() => handlePersonaSelect('class-presentation')}
                        className ="p-3 rounded-lg text-lg font-medium border-2 ${
                            selectedPersona === 'class-presentation'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-black'
                            } hover:bg-blue-600 transition"
                        >
                        Class Presentation
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePersonaSelect('none')}
                        className ="p-3 rounded-lg text-lg font-medium border-2 ${
                            selectedPersona === 'none'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-black'
                            } hover:bg-blue-600 transition"
                        >
                        None
                    </button>
                </div>

                <form className="w-full max-w-[800px] p-8 border border-gray-300 rounded-lg">
                    <div className = "mb-4">
                        <label>
                            Presenting about...
                            <Textarea
                                name ="topic" 
                                value = {formData.topic} 
                                onChange={handleTextareaChange} 
                                required 
                            />
                        </label>
                    </div>

                    <div className="mb-4">
                        <label>
                            Attendees:
                            <Input
                                type="number"
                                name="attendees"
                                value={formData.attendees}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <div className = "mb-4" >
                        <label>
                            Location:
                            <Input name="location" value={formData.location} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className = "mb-4" >
                        <fieldset>
                            <legend>Evaluation Metrics</legend>
                            {(
                                [
                                    'handMovement', 
                                    'headMovement', 
                                    'bodyMovement', 
                                    'posture', 
                                    'handSymmetry', 
                                    'gestureVariety', 
                                    'eyeContact'
                                ] as const
                            ).map(key => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name={key}
                                    checked={formData[key]}
                                    onChange={handleChange}
                                />
                                {key.replace(/(?<!^)([A-Z][a-z])/g, ' $1').charAt(0).toUpperCase() +
                                    key.replace(/(?<!^)([A-Z][a-z])/g, ' $1').slice(1)}
                                </label>
                            ))}
                        </fieldset>
                    </div>
                    
                    <div style = {{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem'}}>
                        Select
                        <button 
                            type="button"
                            onClick={() => handleOptionSelect('practice')}
                            className={`p-4 rounded-lg flex flex-row items-center justify-start 
                                transition ${
                                selectedOption === 'practice' 
                                    ? 'bg-[#dfcbbf] text-black' 
                                    : 'bg-gray-200 text-black'
                            } hover:bg-[#c4a99e]`}
                        > 
                            <ImageUp className = "mr-4 ml-2"/>
                            Practice Now
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleOptionSelect('upload')}
                            className={`p-4 rounded-lg flex flex-row items-center justify-start
                                transition ${
                                selectedOption === 'upload' 
                                    ? 'bg-[#dfcbbf] text-black' 
                                    : 'bg-gray-200 text-black'
                            } hover:bg-[#c4a99e]`}
                        >
                            <Camera className = "mr-4 ml-2"/>
                            Upload Video
                        </button>
                    </div>
                    
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className = "p-2 rounded-lg space-y-4 justify-self-end">
                            <Button type = "button" onClick = {handleStart} disabled = {!selectedOption}>
                                Start
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </PageFormat>
    );
}