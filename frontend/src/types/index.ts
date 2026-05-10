export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Review {
  id: string;
  content: string;
  rating: number;
  sentiment: Sentiment;
  confidence: number;
  date: string;
  platform: string;
  author: string;
}

export interface Product {
  id: string;
  name: string;
  platform: string;
  url: string;
  reviews: Review[];
}

export interface DashboardSummary {
  total_reviews: number;
  positive: number;
  neutral: number;
  negative: number;
  average_rating: number;
  sentiment_score: number;
}

export interface SentimentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TrendData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface Issue {
  issue: string;
  count: number;
  sentiment: Sentiment;
}

export interface DashboardData {
  summary: DashboardSummary;
  sentiment_distribution: SentimentDistribution[];
  trend_data: TrendData[];
  top_issues: Issue[];
  recent_reviews: Review[];
}

export interface ChatSource {
  review: string;
  sentiment: Sentiment;
}

export interface ChatResponse {
  answer: string;
  sources: Review[];
}
