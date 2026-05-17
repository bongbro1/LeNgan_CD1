import axios from 'axios';

const NINE_ROUTER_URL = 'http://localhost:20128/v1';
const DEFAULT_MODEL = 'kr/claude-sonnet-4.5';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const nineRouterApi = axios.create({
  baseURL: NINE_ROUTER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const nineRouterService = {
  /**
   * Gọi chat completion với 9Router
   */
  chatCompletion: async (
    messages: Message[],
    model: string = DEFAULT_MODEL,
    options?: {
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<string> => {
    try {
      const request: ChatCompletionRequest = {
        model,
        messages,
        stream: false,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2000,
      };

      const response = await nineRouterApi.post<ChatCompletionResponse>(
        '/chat/completions',
        request
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      throw new Error('No response from 9Router');
    } catch (error: any) {
      console.error('9Router API error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to connect to 9Router'
      );
    }
  },

  /**
   * Kiểm tra kết nối 9Router
   */
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await axios.get('http://localhost:20128/dashboard/providers/kiro', {
        timeout: 3000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  /**
   * Lấy danh sách models có sẵn
   */
  getAvailableModels: async (): Promise<string[]> => {
    try {
      const response = await nineRouterApi.get('/models');
      return response.data.data?.map((m: any) => m.id) || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [DEFAULT_MODEL];
    }
  },
};

export default nineRouterService;
