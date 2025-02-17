export type StatisticType = {
  icon: React.ReactNode;
  text: string;
  status: number;
};

export type RecordingType = {
  id: string;
  title: string;
  thumbnail: string;
  date: Date;
  overallScore: number;
};
