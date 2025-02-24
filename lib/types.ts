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

export type PresentationType = {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: {
    metric_id: number;
    name: string;
    score: number;
    evaluated_at: string;
  }[];
};

export type ReportItemType = {
  presentation_id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: {
    metric_id: number;
    name: string;
    score: number;
    evaluated_at: string;
  }[];
};

export type UserType = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};
