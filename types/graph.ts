export interface MonthlyStat {
  month: string;
  sessions: number;
  accuracy: number;
  correct: number;
  wrong: number;
  avgTime: number;
}

export const monthlyGraphData: MonthlyStat[] = [
  { month: "Jan", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Feb", sessions: 2, accuracy: 50, correct: 2, wrong: 2, avgTime: 32.45 },
  { month: "Mar", sessions: 1, accuracy: 100, correct: 4, wrong: 0, avgTime: 27 },
  { month: "Apr", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "May", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Jun", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Jul", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Aug", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Sep", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Oct", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Nov", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
  { month: "Dec", sessions: 0, accuracy: 0, correct: 0, wrong: 0, avgTime: 0 },
];
