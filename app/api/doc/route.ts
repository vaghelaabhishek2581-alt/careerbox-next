import { NextResponse } from 'next/server';
import { specs } from '@/lib/swagger';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Career-Box API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
        <style>
          html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
          }
          *, *:before, *:after {
            box-sizing: inherit;
          }
          body {
            margin:0;
            background: #fafafa;
          }
          .topbar {
            background: linear-gradient(135deg, #3B82F6, #8B5CF6) !important;
          }
          .topbar .download-url-wrapper {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: '/api/doc/swagger.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              theme: "material",
              customCss: \`
                .topbar { background: linear-gradient(135deg, #3B82F6, #8B5CF6) !important; }
                .swagger-ui .topbar .download-url-wrapper { display: none; }
                .swagger-ui .info .title { color: #1F2937; }
                .swagger-ui .scheme-container { background: linear-gradient(135deg, #F8FAFC, #F1F5F9); border-radius: 8px; }
              \`
            });
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}