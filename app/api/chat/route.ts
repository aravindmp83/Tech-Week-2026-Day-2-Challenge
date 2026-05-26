import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback Mock Data for AI Chat Context (ensures 100% operational uptime)
const mockStoreData = [
  { store_id: 1, store_name: "Delhi Super 1", region: "North", store_format: "Super", revenue_inr_thousand: 4800, monthly_footfall: 145000, online_sales_pct: 28, fresh_wastage_pct: 5.2, avg_customer_rating: 4.65, stockout_incidents: 12, pickup_fulfillment: 98, data_period: "2023-01" },
  { store_id: 2, store_name: "Noida Express 1", region: "North", store_format: "Express", revenue_inr_thousand: 2300, monthly_footfall: 75000, online_sales_pct: 35, fresh_wastage_pct: 8.9, avg_customer_rating: 3.82, stockout_incidents: 24, pickup_fulfillment: 0, data_period: "2023-01" },
  { store_id: 3, store_name: "Gurugram Hyper 1", region: "North", store_format: "Hyper", revenue_inr_thousand: 9800, monthly_footfall: 310000, online_sales_pct: 22, fresh_wastage_pct: 6.1, avg_customer_rating: 4.45, stockout_incidents: 8, pickup_fulfillment: 95, data_period: "2023-01" },
  
  { store_id: 4, store_name: "Bengaluru Hyper 1", region: "South", store_format: "Hyper", revenue_inr_thousand: 11500, monthly_footfall: 380000, online_sales_pct: 42, fresh_wastage_pct: 4.8, avg_customer_rating: 4.78, stockout_incidents: 5, pickup_fulfillment: 99, data_period: "2023-01" },
  { store_id: 5, store_name: "Chennai Super 2", region: "South", store_format: "Super", revenue_inr_thousand: 5100, monthly_footfall: 160000, online_sales_pct: 30, fresh_wastage_pct: 6.4, avg_customer_rating: 4.38, stockout_incidents: 15, pickup_fulfillment: 96, data_period: "2023-01" },
  { store_id: 6, store_name: "Hyderabad Nbhd 5", region: "South", store_format: "Neighbourhood", revenue_inr_thousand: 1800, monthly_footfall: 42000, online_sales_pct: 12, fresh_wastage_pct: 9.2, avg_customer_rating: 3.65, stockout_incidents: 39, pickup_fulfillment: 85, data_period: "2023-01" },
  
  { store_id: 7, store_name: "Kolkata Hyper 2", region: "East", store_format: "Hyper", revenue_inr_thousand: 8200, monthly_footfall: 245000, online_sales_pct: 18, fresh_wastage_pct: 7.5, avg_customer_rating: 4.25, stockout_incidents: 19, pickup_fulfillment: 0, data_period: "2023-01" },
  { store_id: 8, store_name: "Bhubaneswar Exp 1", region: "East", store_format: "Express", revenue_inr_thousand: 2100, monthly_footfall: 68000, online_sales_pct: 25, fresh_wastage_pct: 8.8, avg_customer_rating: 3.75, stockout_incidents: 28, pickup_fulfillment: 0, data_period: "2023-01" },
  
  { store_id: 9, store_name: "Mumbai Hyper 3", region: "West", store_format: "Hyper", revenue_inr_thousand: 12100, monthly_footfall: 410000, online_sales_pct: 45, fresh_wastage_pct: 5.0, avg_customer_rating: 4.82, stockout_incidents: 4, pickup_fulfillment: 97, data_period: "2023-01" },
  { store_id: 10, store_name: "Pune Express 5", region: "West", store_format: "Express", revenue_inr_thousand: 2900, monthly_footfall: 88000, online_sales_pct: 38, fresh_wastage_pct: 9.1, avg_customer_rating: 3.70, stockout_incidents: 31, pickup_fulfillment: 90, data_period: "2023-01" },
];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json({ 
        role: 'assistant',
        content: `### ⚠️ AI Engine Key Required\nTo enable natural language analytical queries, please provide your **GEMINI_API_KEY** in the \`.env.local\` file in your workspace root, or add it as an Environment Variable in Vercel.\n\n*Meanwhile, here is a mock database answer to show how I function:*\n\n**Question**: "${latestMessage}"\n\n**Simulated Response**:\n- In the **North region**, \`Noida Express 1\` is showing high wastage at **8.9%** and a low rating of **3.82 ★**.\n- In the **South region**, \`Hyderabad Nbhd 5\` represents a critical audit target with **39 stockout incidents** and a low **3.65 ★** rating.\n- In the **West region**, \`Mumbai Hyper 3\` is our star performer, contributing **₹12.10M** in revenue with a rating of **4.82 ★**.`
      });
    }

    // Try fetching from live Supabase
    let activeDataset = mockStoreData;
    let dataSource = 'Mock Database Fallback';
    
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
      try {
        let sanitizedUrl = supabaseUrl.trim();
        if (sanitizedUrl.endsWith('/')) {
          sanitizedUrl = sanitizedUrl.slice(0, -1);
        }
        if (sanitizedUrl.endsWith('/rest/v1')) {
          sanitizedUrl = sanitizedUrl.slice(0, -8);
        }
        const supabase = createClient(sanitizedUrl, supabaseAnonKey);
        
        // 1. Try querying 'Monthly_Activity_Data'
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('Monthly_Activity_Data')
          .select('*');
          
        if (!monthlyError && monthlyData && monthlyData.length > 0) {
          activeDataset = monthlyData;
          dataSource = 'Live Supabase [Monthly_Activity_Data]';
        } else {
          // 2. Try monthly_activity table
          const { data: monthlyData2, error: monthlyError2 } = await supabase
            .from('monthly_activity')
            .select('*');
            
          if (!monthlyError2 && monthlyData2 && monthlyData2.length > 0) {
            activeDataset = monthlyData2;
            dataSource = 'Live Supabase [monthly_activity]';
          } else {
            // 3. Try monthly_activity_data table
            const { data: altData, error: altError } = await supabase
              .from('monthly_activity_data')
              .select('*');
              
            if (!altError && altData && altData.length > 0) {
              activeDataset = altData;
              dataSource = 'Live Supabase [monthly_activity_data]';
            }
          }
        }
      } catch (err) {
        console.error('Supabase query failed, falling back to mock dataset:', err);
      }
    }

    // Format data context for LLM prompt
    const dataContext = activeDataset.map((d: any) => ({
      name: d.store_name || `Store ${d.store_id}`,
      region: d.region,
      format: d.store_format,
      revenue_K: d.revenue_inr_thousand,
      footfall: d.monthly_footfall,
      online_pct: d.online_sales_pct,
      wastage_pct: d.fresh_wastage_pct,
      rating: d.avg_customer_rating,
      stockouts: d.stockout_incidents,
      pickup_fulfillment_pct: d.pickup_fulfillment,
      period: d.data_period
    }));

    // Initialize Gemini using `@google/generative-ai`
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are "FreshLane Retail Leadership Review AI Analyst", a specialized retail business intelligence advisor designed and built using Google Antigravity 2.0. 
You are given a JSON array of active store records representing performance metrics. Your mission is to answer user questions factually, clearly, and concisely, strictly based on this data context.

DATA SOURCE CONTEXT:
${JSON.stringify(dataContext, null, 2)}

DIRECTIONS:
1. Ground your answers 100% in the provided dataset. Never hallucinate stores, names, or values.
2. If the user asks about specific regions, focus on the stores in that region.
3. Highlight critical operational metrics:
   - Fresh Wastage (High is bad, threshold > 8.5%)
   - Average Customer Rating (Low is bad, threshold < 3.9)
   - Stockouts (High is bad, threshold > 25)
   - Pickup Fulfillment (0% is a critical process error)
4. Format your responses beautifully using clear Markdown headings, bullet points, bold emphasis, and neat text tables. Keep your answers executive-level and direct.
5. In your closing line, note the active database scope you queried (e.g. "Analyzed from active dataset: ${dataSource}").`;

    // Package chat history
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Clean up history to satisfy Gemini API rules: first message must be from user ('user'), not AI ('model')
    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    // Generate output
    const chat = model.startChat({
      history: history,
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return NextResponse.json({
      role: 'assistant',
      content: responseText
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process AI chat response', 
      details: error.message 
    }, { status: 500 });
  }
}
