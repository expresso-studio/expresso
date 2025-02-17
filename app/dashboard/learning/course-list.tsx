import React from "react";
import { CourseType } from "@/lib/types";
import { IoHandLeft } from "react-icons/io5";
import { BiCheckDouble, BiSolidSmile } from "react-icons/bi";
import { BsPersonRaisedHand } from "react-icons/bs";
import Course from "@/components/course";

// TODO: remove dummy values
const courses: CourseType[] = [
  {
    id: "123",
    icon: <IoHandLeft />,
    color: "bg-[#D5A585]",
    text: "Hand gestures",
    status: 80,
    nLessons: 20,
  },
  {
    id: "123",
    icon: <BiCheckDouble />,
    color: "bg-[#936648]",
    text: "Memorizing scripts",
    status: 20,
    nLessons: 20,
  },
  {
    id: "123",
    icon: <BiSolidSmile />,
    color: "bg-[#C06C35]",
    text: "Facial expressions",
    status: 30,
    nLessons: 20,
  },
  {
    id: "123",
    icon: <BsPersonRaisedHand />,
    color: "bg-[#6d4b2e]",
    text: "Body language",
    status: 75,
    nLessons: 20,
  },
];

interface Props {
  short?: boolean;
}

const CourseList = React.memo<Props>(function CourseList({ short }) {
  return (
    <div className="flex flex-col gap-2">
      {courses.map(
        (course, i) => (!short || i < 5) && <Course {...course} key={i} />
      )}
    </div>
  );
});

export default CourseList;
