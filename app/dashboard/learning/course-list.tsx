import React from "react";
import Course from "@/components/course";
import { CourseStatus, CourseType } from "@/lib/types";

interface Props {
  courses: (CourseType & CourseStatus)[];
  short?: boolean;
  loading?: boolean;
}

/**
 * CourseList component that renders a list of courses.
 * @param {Props} props - The props for the CourseList component.
 * @returns {JSX.Element} The JSX element representing the list of courses.
 */
const CourseList = React.memo<Props>(function CourseList({
  courses,
  short,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {courses.map(
          (course, i) =>
            (!short || i < 5) && (
              <Course {...course} status={undefined} key={i} />
            )
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {courses.map(
        (course, i) => (!short || i < 5) && <Course {...course} key={i} />,
      )}
    </div>
  );
});

export default CourseList;
