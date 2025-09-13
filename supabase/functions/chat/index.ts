/*
 * Edge Function: AI Chat
 * Simulates FastAPI endpoint structure with Pydantic-style validation
 */

interface ChatRequest {
  message: string;
}

interface ChatMessage {
  id?: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

interface ChatResponse {
  user_message: ChatMessage;
  ai_response: ChatMessage;
}

// Pydantic-style validation
function validateChatRequest(data: any): ChatRequest {
  if (!data.message || typeof data.message !== 'string') {
    throw new Error('Message is required and must be a string');
  }
  
  if (data.message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  if (data.message.length > 4000) {
    throw new Error('Message too long (max 4000 characters)');
  }
  
  return {
    message: data.message.trim()
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body with validation
    const body = await req.json();
    const validatedData = validateChatRequest(body);
    
    // Mock user ID (in real FastAPI, this would come from JWT)
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      content: validatedData.message,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    // Generate AI response (simplified - in real implementation would call OpenAI)
    const aiResponseContent = await generateAIResponse(validatedData.message);
    
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      content: aiResponseContent,
      role: 'assistant',
      created_at: new Date().toISOString()
    };
    
    // In real FastAPI app, these would be saved to database via SQLAlchemy
    // Here we simulate the response structure
    
    const response: ChatResponse = {
      user_message: userMessage,
      ai_response: aiMessage
    };
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
    
  } catch (error) {
    console.error('Chat error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        type: 'ValidationError'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function generateAIResponse(message: string): Promise<string> {
  // Simulate different types of responses based on input
  const responses = [
    `That's an interesting question about "${message}". Let me help you with that.`,
    `I understand you're asking about "${message}". Here's what I think...`,
    `Great question! Regarding "${message}", I'd say that it depends on several factors.`,
    `Thanks for sharing that. About "${message}" - this is a topic I find fascinating.`
  ];
  
  // Simple response selection (in real app, this would be OpenAI API call)
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add some realistic delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  return randomResponse;
}