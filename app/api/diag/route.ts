import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const geminiApiKey = process.env.GEMINI_API_KEY || '';

  const report: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: {
        defined: !!supabaseUrl,
        value: supabaseUrl || 'NOT DEFINED',
        sanitizedValue: ''
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        defined: !!supabaseAnonKey,
        length: supabaseAnonKey.length,
        prefix: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 8)}...` : 'NONE',
        isPlaceholder: supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE' || supabaseAnonKey === 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      },
      GEMINI_API_KEY: {
        defined: !!geminiApiKey,
        length: geminiApiKey.length,
        prefix: geminiApiKey ? `${geminiApiKey.substring(0, 5)}...` : 'NONE',
        isPlaceholder: geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE'
      }
    },
    databaseConnection: {
      status: 'NOT ATTEMPTED',
      details: null
    }
  };

  // Sanitize Supabase URL
  let sanitizedUrl = supabaseUrl.trim();
  if (sanitizedUrl.endsWith('/')) {
    sanitizedUrl = sanitizedUrl.slice(0, -1);
  }
  if (sanitizedUrl.endsWith('/rest/v1')) {
    sanitizedUrl = sanitizedUrl.slice(0, -8);
  }
  report.environment.NEXT_PUBLIC_SUPABASE_URL.sanitizedValue = sanitizedUrl;

  if (!supabaseUrl || !supabaseAnonKey) {
    report.databaseConnection.status = 'FAILED';
    report.databaseConnection.details = 'Supabase URL or Anon Key is missing in environment variables.';
    return NextResponse.json(report);
  }

  try {
    const supabase = createClient(sanitizedUrl, supabaseAnonKey);
    
    // Test Monthly_Activity_Data
    const { data: data1, error: error1 } = await supabase
      .from('Monthly_Activity_Data')
      .select('*')
      .limit(1);

    if (!error1) {
      report.databaseConnection.status = 'SUCCESS';
      report.databaseConnection.details = `Successfully connected to 'Monthly_Activity_Data'. First row fetched.`;
      report.databaseConnection.rowCount = data1 ? data1.length : 0;
      return NextResponse.json(report);
    }

    report.databaseConnection.Monthly_Activity_Data_Error = {
      message: error1.message,
      code: error1.code,
      details: error1.details
    };

    // Test monthly_activity
    const { data: data2, error: error2 } = await supabase
      .from('monthly_activity')
      .select('*')
      .limit(1);

    if (!error2) {
      report.databaseConnection.status = 'SUCCESS';
      report.databaseConnection.details = `Successfully connected to legacy 'monthly_activity'. First row fetched.`;
      report.databaseConnection.rowCount = data2 ? data2.length : 0;
      return NextResponse.json(report);
    }

    report.databaseConnection.monthly_activity_Error = {
      message: error2.message,
      code: error2.code,
      details: error2.details
    };

    report.databaseConnection.status = 'FAILED';
    report.databaseConnection.details = 'All database table scans failed. Check error details below.';

  } catch (err: any) {
    report.databaseConnection.status = 'CRASHED';
    report.databaseConnection.details = err.message;
  }

  return NextResponse.json(report);
}
