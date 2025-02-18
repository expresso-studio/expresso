export type StatisticType = {
  icon: React.ReactNode;
  text: string;
  status: number;
};

export type CourseType = {
  id: string;
  icon: React.ReactNode;
  color: string;
  text: string;
  status: number;
  nLessons: number;
};

export type RecordingType = {
  id: string;
  title: string;
  thumbnail: string;
  date: Date;
  overallScore: number;
};
