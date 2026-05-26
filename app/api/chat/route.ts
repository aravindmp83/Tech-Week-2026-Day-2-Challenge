import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import localStoreData from '../../data/monthly_activity.json';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lightweight data pre-aggregation to give Gemini high-level global knowledge of all 2,520 records
const getDatasetSummary = (dataset: any[]) => {
  if (!dataset || dataset.length === 0) {
    return {
      total_records: 0,
      total_revenue_K: 0,
      avg_wastage_pct: '0.00',
      avg_rating: '0.00',
      total_footfall: 0,
      regions: [],
      monthly_trends: []
    };
  }

  const totalRevenue = dataset.reduce((acc, curr) => acc + (curr.revenue_inr_thousand || 0), 0);
  const averageWastage = dataset.reduce((acc, curr) => acc + (curr.fresh_wastage_pct || 0), 0) / dataset.length;
  const averageRating = dataset.reduce((acc, curr) => acc + (curr.avg_customer_rating || 0), 0) / dataset.length;
  const totalFootfall = dataset.reduce((acc, curr) => acc + (curr.monthly_footfall || 0), 0);
  
  // Region-wise aggregation
  const regionStats: Record<string, { revenue: number; count: number; ratingSum: number; wastageSum: number }> = {};
  dataset.forEach(d => {
    if (!regionStats[d.region]) {
      regionStats[d.region] = { revenue: 0, count: 0, ratingSum: 0, wastageSum: 0 };
    }
    regionStats[d.region].revenue += d.revenue_inr_thousand || 0;
    regionStats[d.region].count += 1;
    regionStats[d.region].ratingSum += d.avg_customer_rating || 0;
    regionStats[d.region].wastageSum += d.fresh_wastage_pct || 0;
  });

  const regionsSummary = Object.entries(regionStats).map(([region, stats]) => ({
    region,
    total_revenue_K: Math.round(stats.revenue),
    avg_rating: (stats.ratingSum / stats.count).toFixed(2),
    avg_wastage_pct: (stats.wastageSum / stats.count).toFixed(2),
    record_count: stats.count
  }));

  // Month-wise aggregation (latest 12 months to keep overview compact)
  const monthStats: Record<string, { revenue: number; count: number }> = {};
  dataset.forEach(d => {
    if (!monthStats[d.data_period]) {
      monthStats[d.data_period] = { revenue: 0, count: 0 };
    }
    monthStats[d.data_period].revenue += d.revenue_inr_thousand || 0;
    monthStats[d.data_period].count += 1;
  });

  const monthlyTrendsSummary = Object.entries(monthStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Keep only recent 12 months for prompt optimization
    .map(([month, stats]) => ({
      month,
      total_revenue_K: Math.round(stats.revenue),
      store_count: stats.count
    }));

  return {
    total_records: dataset.length,
    total_revenue_K: Math.round(totalRevenue),
    avg_wastage_pct: averageWastage.toFixed(2),
    avg_rating: averageRating.toFixed(2),
    total_footfall: totalFootfall,
    regions: regionsSummary,
    monthly_trends: monthlyTrendsSummary
  };
};

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
        content: `### ⚠️ AI Engine Key Required\nTo enable natural language analytical queries, please provide your **GEMINI_API_KEY** in the \`.env.local\` file in your workspace root, or add it as an Environment Variable in Vercel.\n\n*Meanwhile, here is a mock database answer to show how I function:*\n\n**Question**: "${latestMessage}"\n\n**Simulated Response**:\n- In the **North region**, \`FreshLane Delhi Superstore 1\` is showing performance with an average customer rating of **3.67 ★**.\n- Across the chain, the total revenue logged in the 2,520 records is **₹5.14B** with an average customer rating of **4.12 ★**.\n- Please configure your Gemini API Key to enable complete AI-driven semantic queries against the entire real-world dataset!`
      });
    }

    // Try fetching from live Supabase
    let activeDataset = localStoreData;
    let dataSource = 'Local JSON Compilation';
    
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
        console.error('Supabase query failed, falling back to local JSON compilation:', err);
      }
    }

    // Pre-aggregate global stats from activeDataset
    const globalSummary = getDatasetSummary(activeDataset);

    // Apply smart filters to keep prompt size highly efficient and context response blazing fast
    let filteredRecords = activeDataset;
    let filterReason = 'August 2025 (Latest Month Baseline)';

    const queryLower = latestMessage.toLowerCase();
    
    // 1. Filter by specific store name or ID if mentioned
    const mentionedStore = activeDataset.find(d => 
      (d.store_id && queryLower.includes(d.store_id.toLowerCase())) || 
      (d.store_name && queryLower.includes(d.store_name.toLowerCase()))
    );

    if (mentionedStore) {
      // Find all records for this specific store (historical trend)
      filteredRecords = activeDataset.filter(d => d.store_id === mentionedStore.store_id);
      filterReason = `Historical Trend for Store: ${mentionedStore.store_name} (${mentionedStore.store_id})`;
    } else {
      // Check region filters
      const regions = ['north', 'south', 'east', 'west'];
      const matchedRegion = regions.find(r => queryLower.includes(r));

      // Check format filters
      const formats = ['super', 'express', 'hyper', 'neighbourhood', 'neighborhood'];
      const matchedFormat = formats.find(f => queryLower.includes(f));

      // Check for struggling/critical query keywords
      const isCriticalQuery = queryLower.includes('struggling') || 
                               queryLower.includes('critical') || 
                               queryLower.includes('alert') || 
                               queryLower.includes('bad') || 
                               queryLower.includes('wastage') || 
                               queryLower.includes('complaint') ||
                               queryLower.includes('worst');

      if (isCriticalQuery) {
        // Filter for struggling stores: high wastage (> 8.5%) or low rating (< 3.9) in the latest few periods
        filteredRecords = activeDataset.filter(d => 
          (d.fresh_wastage_pct > 8.5 || d.avg_customer_rating < 3.9 || d.stockout_incidents > 25) &&
          (d.data_period === '2025-08' || d.data_period === '2025-07')
        );
        filterReason = 'Struggling & High-Risk Stores (July - August 2025)';
      } else if (matchedRegion && matchedFormat) {
        filteredRecords = activeDataset.filter(d => 
          d.region.toLowerCase() === matchedRegion && 
          d.store_format.toLowerCase().includes(matchedFormat.replace('neighborhood', 'neighbourhood'))
        );
        filterReason = `Region: ${matchedRegion.toUpperCase()} | Format: ${matchedFormat.toUpperCase()}`;
      } else if (matchedRegion) {
        if (queryLower.includes('trend') || queryLower.includes('history') || queryLower.includes('historical') || queryLower.includes('over time')) {
          filteredRecords = activeDataset.filter(d => d.region.toLowerCase() === matchedRegion);
          filterReason = `Historical Trend for Region: ${matchedRegion.toUpperCase()}`;
        } else {
          filteredRecords = activeDataset.filter(d => 
            d.region.toLowerCase() === matchedRegion && d.data_period === '2025-08'
          );
          filterReason = `Latest Status (August 2025) for Region: ${matchedRegion.toUpperCase()}`;
        }
      } else if (matchedFormat) {
        if (queryLower.includes('trend') || queryLower.includes('history') || queryLower.includes('over time')) {
          filteredRecords = activeDataset.filter(d => d.store_format.toLowerCase().includes(matchedFormat.replace('neighborhood', 'neighbourhood')));
          filterReason = `Historical Trend for Format: ${matchedFormat.toUpperCase()}`;
        } else {
          filteredRecords = activeDataset.filter(d => 
            d.store_format.toLowerCase().includes(matchedFormat.replace('neighborhood', 'neighbourhood')) && d.data_period === '2025-08'
          );
          filterReason = `Latest Status (August 2025) for Format: ${matchedFormat.toUpperCase()}`;
        }
      } else {
        // Baseline: Latest Month's records (August 2025) which has exactly 126 stores.
        // This is perfectly comprehensive and fits in the LLM prompt beautifully.
        filteredRecords = activeDataset.filter(d => d.data_period === '2025-08');
        
        // Also append critical stores from July 2025 so the analyst gets recent critical issues
        const extraCritical = activeDataset.filter(d => 
          d.data_period === '2025-07' && (d.fresh_wastage_pct > 8.5 || d.avg_customer_rating < 3.9)
        );
        filteredRecords = [...filteredRecords, ...extraCritical];
      }
    }

    // Format data context for LLM prompt
    const dataContext = filteredRecords.map((d: any) => ({
      id: d.store_id,
      name: d.store_name,
      region: d.region,
      city: d.city,
      format: d.store_format,
      revenue_K: d.revenue_inr_thousand,
      footfall: d.monthly_footfall,
      online_pct: d.online_sales_pct,
      wastage_pct: d.fresh_wastage_pct,
      rating: d.avg_customer_rating,
      stockouts: d.stockout_incidents,
      pickup_fulfillment_pct: d.pickup_fulfillment_rate_pct !== undefined ? d.pickup_fulfillment_rate_pct : (d.pickup_fulfillment !== undefined ? d.pickup_fulfillment : 0),
      period: d.data_period
    }));

    // Initialize Gemini using `@google/generative-ai`
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are the "FreshLane Retail Leadership Review AI Analyst", a premium business intelligence advisor built using Google Antigravity 2.0.
Your goal is to answer executive questions with high precision, basing all facts on the provided data context.

GLOBAL DATASETS OVERVIEW (Full 2,520 records summary):
- Total Logs Count: ${globalSummary.total_records}
- Total Cumulative Revenue: ₹${(globalSummary.total_revenue_K / 1000).toFixed(2)}M (₹${globalSummary.total_revenue_K} Thousand)
- Average Wastage rate: ${globalSummary.avg_wastage_pct}%
- Average Customer Rating: ${globalSummary.avg_rating} ★
- Total Footfall: ${globalSummary.total_footfall.toLocaleString()}
- Region-wise Breakdown: ${JSON.stringify(globalSummary.regions, null, 2)}
- Recent Monthly Trends (Revenue in Thousands): ${JSON.stringify(globalSummary.monthly_trends, null, 2)}

SPECIFIC FILTERED STORE-LEVEL RECORDS CONTEXT (Subset queried for this request):
- Subset Filter: ${filterReason}
- Record Count: ${dataContext.length}
- Store Records:
${JSON.stringify(dataContext, null, 2)}

DIRECTIONS:
1. Ground your answers 100% in the provided dataset. Never hallucinate stores, names, or values.
2. If the user asks about specific regions, focus on the stores in that region using the specific filtered store-level records context or the global summary.
3. Highlight critical operational metrics when asked or when diagnosing:
   - Fresh Wastage (High is bad, threshold > 8.5%)
   - Average Customer Rating (Low is bad, threshold < 3.9)
   - Stockouts (High is bad, threshold > 25)
   - Pickup Fulfillment (0% or low is a critical process error)
4. Format your responses beautifully using clear Markdown headings, bullet points, bold emphasis, and neat text tables. Keep your answers executive-level, analytical, direct, and professional.
5. In your closing line, note the active database scope you queried (e.g. "Analyzed from active dataset: ${dataSource} | Query Scope: ${filterReason}").`;

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
