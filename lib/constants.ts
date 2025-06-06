import { CourseStatus, CourseType, LessonStatus } from "./types";
import { IconType } from "react-icons";

import { MdOutlineWavingHand } from "react-icons/md";
import { FaPersonFalling, FaHandSparkles } from "react-icons/fa6";
import { LuPersonStanding, LuEye, LuSpeech, LuSmile } from "react-icons/lu";
import { PiHandsPrayingFill } from "react-icons/pi";
import { IoHandLeft } from "react-icons/io5";
import { BiCheckDouble, BiSolidSmile } from "react-icons/bi";
import { BsPersonRaisedHand } from "react-icons/bs";
import { TbMessageChatbotFilled } from "react-icons/tb";

export enum MetricNames {
  HandMovement = "HandMovement",
  HeadMovement = "HeadMovement",
  BodyMovement = "BodyMovement",
  Posture = "Posture",
  HandSymmetry = "HandSymmetry",
  GestureVariety = "GestureVariety",
  EyeContact = "EyeContact",
  OverallScore = "OverallScore",
}

export enum MetricDisplayNames {
  HandMovement = "Hand Movement",
  HeadMovement = "Head Movement",
  BodyMovement = "Body Movement",
  Posture = "Posture",
  HandSymmetry = "Hand Symmetry",
  GestureVariety = "Gesture Variety",
  EyeContact = "Eye Contact",
  OverallScore = "Overall Score",
}

export enum MetricIds {
  HandMovement = 1,
  HeadMovement = 2,
  BodyMovement = 3,
  Posture = 4,
  HandSymmetry = 5,
  GestureVariety = 6,
  EyeContact = 7,
  OverallScore = 8,
}


export const MetricNameToIcon: Record<MetricNames, IconType> = {
  [MetricNames.HandMovement]: MdOutlineWavingHand,
  [MetricNames.HeadMovement]: LuSmile,
  [MetricNames.BodyMovement]: FaPersonFalling,
  [MetricNames.Posture]: LuPersonStanding,
  [MetricNames.HandSymmetry]: PiHandsPrayingFill,
  [MetricNames.GestureVariety]: FaHandSparkles,
  [MetricNames.EyeContact]: LuEye,
  [MetricNames.OverallScore]: LuSpeech,
};

export const MetricNameToId: Record<MetricNames, MetricIds> = {
  [MetricNames.HandMovement]: MetricIds.HandMovement,
  [MetricNames.HeadMovement]: MetricIds.HeadMovement,
  [MetricNames.BodyMovement]: MetricIds.BodyMovement,
  [MetricNames.Posture]: MetricIds.Posture,
  [MetricNames.HandSymmetry]: MetricIds.HandSymmetry,
  [MetricNames.GestureVariety]: MetricIds.GestureVariety,
  [MetricNames.EyeContact]: MetricIds.EyeContact,
  [MetricNames.OverallScore]: MetricIds.OverallScore,
};

export const MetricIdToName: Record<MetricIds, MetricNames> = {
  [MetricIds.HandMovement]: MetricNames.HandMovement,
  [MetricIds.HeadMovement]: MetricNames.HeadMovement,
  [MetricIds.BodyMovement]: MetricNames.BodyMovement,
  [MetricIds.Posture]: MetricNames.Posture,
  [MetricIds.HandSymmetry]: MetricNames.HandSymmetry,
  [MetricIds.GestureVariety]: MetricNames.GestureVariety,
  [MetricIds.EyeContact]: MetricNames.EyeContact,
  [MetricIds.OverallScore]: MetricNames.OverallScore,
};

export const MetricNameToDisplay: Record<MetricNames, MetricDisplayNames> = {
  [MetricNames.HandMovement]: MetricDisplayNames.HandMovement,
  [MetricNames.HeadMovement]: MetricDisplayNames.HeadMovement,
  [MetricNames.BodyMovement]: MetricDisplayNames.BodyMovement,
  [MetricNames.Posture]: MetricDisplayNames.Posture,
  [MetricNames.HandSymmetry]: MetricDisplayNames.HandSymmetry,
  [MetricNames.GestureVariety]: MetricDisplayNames.GestureVariety,
  [MetricNames.EyeContact]: MetricDisplayNames.EyeContact,
  [MetricNames.OverallScore]: MetricDisplayNames.OverallScore,
};

export enum CourseNames {
  Intro = "Public Speaking Basics",
  HandLanguage = "How to use your Hands",
  BodyLanguage = "Body Language",
  HeadLanguage = "Use your Head!",
  Gestures = "Gesturing",
}

export enum CourseLinks {
  Intro = "intro",
  HandLanguage = "hand-language",
  BodyLanguage = "body-language",
  HeadLanguage = "head-language",
  Gestures = "gestures",
}

export const CourseNameToLink: Record<CourseNames, CourseLinks> = {
  [CourseNames.Intro]: CourseLinks.Intro,
  [CourseNames.HandLanguage]: CourseLinks.HandLanguage,
  [CourseNames.BodyLanguage]: CourseLinks.BodyLanguage,
  [CourseNames.HeadLanguage]: CourseLinks.HeadLanguage,
  [CourseNames.Gestures]: CourseLinks.Gestures,
};

export enum LessonNames {
  Basics = "Basics",
  HandMovement = MetricDisplayNames.HandMovement,
  HandSymmetry = MetricDisplayNames.HandSymmetry,
  BodyMovement = MetricDisplayNames.BodyMovement,
  Posture = MetricDisplayNames.Posture,
  HeadMovement = MetricDisplayNames.HeadMovement,
  EyeContact = MetricDisplayNames.EyeContact,
  GestureVariety = MetricDisplayNames.GestureVariety,
}

export enum LessonLinks {
  Basics = "basics",
  HandMovement = "hand-movement",
  HandSymmetry = "hand-symmetry",
  BodyMovement = "body-movement",
  Posture = "posture",
  HeadMovement = "head-movement",
  EyeContact = "eye-contact",
  GestureVariety = "gesture-variety",
}

export const LessonNameToLink: Record<LessonNames, LessonLinks> = {
  [LessonNames.Basics]: LessonLinks.Basics,
  [LessonNames.HandMovement]: LessonLinks.HandMovement,
  [LessonNames.HandSymmetry]: LessonLinks.HandSymmetry,
  [LessonNames.BodyMovement]: LessonLinks.BodyMovement,
  [LessonNames.Posture]: LessonLinks.Posture,
  [LessonNames.HeadMovement]: LessonLinks.HeadMovement,
  [LessonNames.EyeContact]: LessonLinks.EyeContact,
  [LessonNames.GestureVariety]: LessonLinks.GestureVariety,
};

export const Courses: CourseType[] = [
  {
    id: 1,
    icon: TbMessageChatbotFilled,
    color: "#D5A585",
    name: CourseNames.Intro,
    lessons: [
      {
        id: 1,
        icon: IoHandLeft,
        name: LessonNames.Basics,
        topics: ["basics", "general"],
      },
    ],
    topics: ["basics", "general"],
  },
  {
    id: 2,
    icon: IoHandLeft,
    color: "#936648",
    name: CourseNames.HandLanguage,
    lessons: [
      {
        id: 2,
        icon: MetricNameToIcon.HandMovement,
        name: LessonNames.HandMovement,
        topics: [MetricDisplayNames.HandMovement],
      },
      {
        id: 3,
        icon: MetricNameToIcon.HandSymmetry,
        name: LessonNames.HandSymmetry,
        topics: [MetricDisplayNames.HandSymmetry],
      },
    ],
    topics: [MetricDisplayNames.HandMovement, MetricDisplayNames.HandSymmetry],
  },
  {
    id: 3,
    icon: BsPersonRaisedHand,
    color: "#C06C35",
    name: CourseNames.BodyLanguage,
    lessons: [
      {
        id: 4,
        icon: MetricNameToIcon.Posture,
        name: LessonNames.Posture,
        topics: [MetricDisplayNames.Posture],
      },
      {
        id: 5,
        icon: MetricNameToIcon.BodyMovement,
        name: LessonNames.BodyMovement,
        topics: [MetricDisplayNames.BodyMovement],
      },
    ],
    topics: [MetricDisplayNames.Posture, MetricDisplayNames.BodyMovement],
  },
  {
    id: 4,
    icon: BiSolidSmile,
    color: "#6d4b2e",
    name: CourseNames.HeadLanguage,
    lessons: [
      {
        id: 6,
        icon: MetricNameToIcon.HeadMovement,
        name: LessonNames.HeadMovement,
        topics: [MetricDisplayNames.HeadMovement],
      },
      {
        id: 7,
        icon: MetricNameToIcon.EyeContact,
        name: LessonNames.EyeContact,
        topics: [MetricDisplayNames.EyeContact],
      },
    ],
    topics: [MetricDisplayNames.HeadMovement, MetricDisplayNames.EyeContact],
  },
  {
    id: 5,
    icon: BiCheckDouble, // TODO(casey): change this
    color: "#110C09",
    name: CourseNames.Gestures,
    lessons: [
      {
        id: 8,
        icon: MetricNameToIcon.GestureVariety,
        name: LessonNames.GestureVariety,
        topics: [MetricDisplayNames.GestureVariety],
      },
    ],
    topics: [MetricDisplayNames.GestureVariety],
  },
];

// TODO(casey): replace this with stuff from DB
export const CourseStatuses: CourseStatus[] = [
  {
    name: CourseNames.Intro,
    status: 0,
  },
  {
    name: CourseNames.HandLanguage,
    status: 100,
  },
  {
    name: CourseNames.BodyLanguage,
    status: 50,
  },
  {
    name: CourseNames.HeadLanguage,
    status: 50,
  },
  {
    name: CourseNames.Gestures,
    status: 0,
  },
];

// TODO(casey): replace this with stuff from DB
export const LessonStatuses: LessonStatus[] = [
  {
    name: LessonNames.Basics,
    status: false,
  },
  {
    name: LessonNames.HandMovement,
    status: true,
  },
  {
    name: LessonNames.HandSymmetry,
    status: true,
  },
  {
    name: LessonNames.Posture,
    status: true,
  },
  {
    name: LessonNames.BodyMovement,
    status: false,
  },
  {
    name: LessonNames.HeadMovement,
    status: false,
  },
  {
    name: LessonNames.EyeContact,
    status: true,
  },
  {
    name: LessonNames.GestureVariety,
    status: false,
  },
];

// Buffer sizes and coefficients
export const MOVEMENT_BUFFER_SIZE = 60; // 2 seconds at 30fps
export const POSTURE_COEFFICIENT = 0.25;
export const HAND_MOVEMENT_COEFFICIENT = 0.2;
export const HEAD_MOVEMENT_COEFFICIENT = 0.15;
export const BODY_MOVEMENT_COEFFICIENT = 0.15;
export const HAND_SYMMETRY_COEFFICIENT = 0.1;
export const GESTURE_VARIETY_COEFFICIENT = 0.05;
export const EYE_CONTACT_COEFFICIENT = 0.1;

// Optimal value ranges for public speaking - with wider ranges for easier achievement
export const OPTIMAL_RANGES = {
  HandMovement: { min: 0.08, max: 0.7 }, // Even wider range for hand movement
  HeadMovement: { min: 0.01, max: 0.5 }, // Wider range for head movement
  BodyMovement: { min: 0.02, max: 0.6 }, // New parameter with wide range
  Posture: { min: 0.4, max: 1.0 }, // Lower threshold for good Posture
  HandSymmetry: { min: 0.2, max: 0.9 }, // Even lower minimum threshold
  GestureVariety: { min: 0.15, max: 0.9 }, // Lower minimum threshold
  EyeContact: { min: 0.3, max: 0.9 }, // Lower minimum threshold
};
