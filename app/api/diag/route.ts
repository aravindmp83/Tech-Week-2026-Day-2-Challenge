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
        isPlaceholder: false
      }
    },
    databaseSchemaInfo: {
      exposedTables: []
    },
    tableScans: {}
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
    report.error = 'Supabase credentials missing.';
    return NextResponse.json(report);
  }

  try {
    // Fetch OpenAPI spec directly from Supabase REST endpoint
    const swaggerUrl = `${sanitizedUrl}/rest/v1/`;
    const res = await fetch(swaggerUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (res.ok) {
      const swagger = await res.json();
      if (swagger && swagger.definitions) {
        report.databaseSchemaInfo.exposedTables = Object.keys(swagger.definitions);
        report.databaseSchemaInfo.fullDefinitionsCount = Object.keys(swagger.definitions).length;
      } else if (swagger && swagger.paths) {
        // Fallback check
        const tables = Object.keys(swagger.paths)
          .map(p => p.replace('/', ''))
          .filter(p => p !== '');
        report.databaseSchemaInfo.exposedTables = [...new Set(tables)];
      }
    } else {
      report.databaseSchemaInfo.error = `Failed to fetch Swagger spec: ${res.status} ${res.statusText}`;
    }
  } catch (swaggerErr: any) {
    report.databaseSchemaInfo.error = `Swagger fetch crashed: ${swaggerErr.message}`;
  }

  try {
    const supabase = createClient(sanitizedUrl, supabaseAnonKey);
    const tablesToScan = [
      'Monthly_Activity_Data',
      'monthly_activity_data',
      'monthly_activity',
      'Yearly_Operations_Master',
      'yearly_operations_master',
      'yearly_operations'
    ];

    for (const table of tablesToScan) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(3);

        if (!error) {
          report.tableScans[table] = {
            exists: true,
            rowCount: data ? data.length : 0,
            status: 'SUCCESS',
            previewRow: data && data.length > 0 ? data[0] : 'EMPTY_TABLE'
          };
        } else {
          if (error.code === 'PGRST205') {
            report.tableScans[table] = {
              exists: false,
              status: 'TABLE_DOES_NOT_EXIST',
              message: error.message
            };
          } else {
            report.tableScans[table] = {
              exists: true,
              status: 'ERROR',
              code: error.code,
              message: error.message
            };
          }
        }
      } catch (tableErr: any) {
        report.tableScans[table] = {
          exists: 'unknown',
          status: 'CRASHED',
          message: tableErr.message
        };
      }
    }

  } catch (err: any) {
    report.error = `Client initialization crashed: ${err.message}`;
  }

  return NextResponse.json(report);
}
